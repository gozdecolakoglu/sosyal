import Photo from '../models/photoModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const createPhoto = async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: 'social',
    }
  );

  try {
    await Photo.create({
      name: req.body.name,
      description: req.body.description,
      user: res.locals.user._id,
      url: result.secure_url,
      image_id: result.public_id,
    });

    fs.unlinkSync(req.files.image.tempFilePath);

    res.status(201).redirect('/users/dashboard');
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAllPhotos = async (req, res) => {
  try {
    const perPage = 12;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const search = (req.query.search || '').trim();

    // Build filter: optionally exclude current user's photos
    const filter = {};
    if (res.locals.user) {
      filter.user = { $ne: res.locals.user._id };
    }

    // Add search condition (name OR description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const totalPhotos = await Photo.countDocuments(filter);
    const totalPages = Math.ceil(totalPhotos / perPage) || 1;
    const currentPage = Math.min(page, totalPages);

    const photos = await Photo.find(filter)
      .sort({ uploadedAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).render('photos', {
      photos,
      link: 'photos',
      currentPage,
      totalPages,
      totalPhotos,
      search,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const getAPhoto = async (req, res) => {
  try {
    const photo = await Photo.findById({ _id: req.params.id })
      .populate('user')
      .populate('comments.postedBy');

    let isOwner = false;
    let isLiked = false;
    let isDisliked = false;

    if (res.locals.user) {
      isOwner = photo.user.equals(res.locals.user._id);
      isLiked = photo.likes.some(likeId => likeId.equals(res.locals.user._id));
      isDisliked = photo.dislikes.some(dislikeId => dislikeId.equals(res.locals.user._id));
    }

    res.status(200).render('photo', {
      photo,
      link: 'photos',
      isOwner,
      isLiked,
      isDisliked
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    // 1. Fotoğrafın varlığını kontrol et
    if (!photo) {
      return res.status(404).json({ 
        succeded: false, 
        error: "There is no photo!" 
      });
    }

    // 2. Kullanıcı yetkisi kontrolü (Sadece fotoğraf sahibi silebilsin)
    if (photo.user.toString() !== res.locals.user._id.toString()) {
      return res.status(403).json({ 
        succeded: false, 
        error: "You have not authority!" 
      });
    }

    // 3. Cloudinary'den fotoğrafı sil
    const photoId = photo.image_id;
    await cloudinary.uploader.destroy(photoId); 

    // 4. Veritabanından fotoğrafı sil
    await Photo.findByIdAndDelete(req.params.id);

    // 5. Başarılı yanıt
    res.status(200).redirect('/users/dashboard');

  } catch (error) {
    // Hata durumunda detayları logla
    console.error("Silme hatası:", error);
    res.status(500).json({
      succeded: false,
      error: error.message 
    });
  }
};

const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (req.files) {
      const photoId = photo.image_id;
      await cloudinary.uploader.destroy(photoId);

      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: 'social',
        }
      );

      photo.url = result.secure_url;
      photo.image_id = result.public_id;

      fs.unlinkSync(req.files.image.tempFilePath);
    }

    photo.name = req.body.name;
    photo.description = req.body.description;

    photo.save();

    res.status(200).redirect(`/photos/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

const addComment = async (req, res) => {
  try {
    if (!res.locals.user) {
      return res.status(401).redirect('/users/login');
    }

    const photo = await Photo.findById(req.params.id);
    photo.comments.push({
      text: req.body.text,
      postedBy: res.locals.user._id
    });

    await photo.save();
    res.redirect(`/photos/${req.params.id}`);

  } catch (error) {
    res.status(500).json({
      succeded: false,
      error
    });
  }
};

const likePhoto = async (req, res) => {
  try {
    if (!res.locals.user) {
      return res.status(401).redirect('/users/login');
    }

    const userId = res.locals.user._id;
    const photo = await Photo.findById(req.params.id);

    const hasLiked = photo.likes.some(likeId => likeId.equals(userId));
    const hasDisliked = photo.dislikes.some(dislikeId => dislikeId.equals(userId));

    if (hasLiked) {
      photo.likes.pull(userId);
    } else {
      photo.likes.addToSet(userId);
      if (hasDisliked) {
        photo.dislikes.pull(userId);
      }
    }

    await photo.save();
    res.redirect(`/photos/${req.params.id}`);

  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};

const dislikePhoto = async (req, res) => {
  try {
    if (!res.locals.user) {
      return res.status(401).redirect('/users/login');
    }

    const userId = res.locals.user._id;
    const photo = await Photo.findById(req.params.id);

    const hasDisliked = photo.dislikes.some(dislikeId => dislikeId.equals(userId));
    const hasLiked = photo.likes.some(likeId => likeId.equals(userId));

    if (hasDisliked) {
      photo.dislikes.pull(userId);
    } else {
      photo.dislikes.addToSet(userId);
      if (hasLiked) {
        photo.likes.pull(userId);
      }
    }

    await photo.save();
    res.redirect(`/photos/${req.params.id}`);

  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};

export { createPhoto, getAllPhotos, getAPhoto, deletePhoto, updatePhoto, addComment, dislikePhoto, likePhoto, };