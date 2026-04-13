import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Photo from '../models/photoModel.js';
import cloudinary from 'cloudinary';
import fs from 'fs';

const createUser = async (req, res) => {

  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user._id });

  } catch (error) {
    console.log('ERROR', error);
    let errors2 = {};
    if (error.code === 11000) {
      errors2.email = 'The Email or Username is already registered';
    }
    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }
    res.status(400).json(errors2);
  }
};
const loginUser = async (req, res) => {

  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const same = user ? await bcrypt.compare(password, user.password) : false;

    // Kullanıcı adı veya şifre hatalıysa tek bir mesaj döndür
    if (!user || !same) {
      return res.status(401).json({
        succeded: false,
        succeeded: false,
        error: 'kullanıcı adı ve ya şifre hatalıdır',
      });
    }

    const token = createToken(user._id);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    return res.status(200).json({
      succeded: true,
      succeeded: true,
      redirect: '/users/dashboard',
    });

  } catch (error) {
    return res.status(500).json({
      succeded: false,
      succeeded: false,
      error: 'Sunucu hatası',
    });
  }
};
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const getDashboardPage = async (req, res) => {
  const photos = await Photo.find({ user: res.locals.user._id }).sort({ uploadedAt: -1 }).limit(10);
  const user = await User.findById({ _id: res.locals.user._id }).populate([
    'followings',
    'followers',
  ]);
  res.render('dashboard', {
    link: 'dashboard',
    photos,
    user,
  });
};
const getAllUsers = async (req, res) => {
  try {
    const perPage = 12;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const search = (req.query.search || '').trim();

    // Build filter: exclude current user + optional search
    const filter = { _id: { $ne: res.locals.user._id } };
    if (search) {
      filter.username = { $regex: search, $options: 'i' };
    }

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / perPage) || 1;
    const currentPage = Math.min(page, totalPages);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).render('users', {
      users,
      link: 'users',
      currentPage,
      totalPages,
      totalUsers,
      search,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const getAUser = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id }).populate([
      'followers',
      'followings',
    ]);
    const inFollowers = user.followers.some((follower) => {
      return follower._id.equals(res.locals.user._id);
    });
    const photos = await Photo.find({ user: user._id }).sort({ uploadedAt: -1 }).limit(10);
    res.status(200).render('user', {
      user,
      photos,
      link: 'users',
      inFollowers,
    });
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const follow = async (req, res) => {
  // res.locals.user._id
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: { followers: res.locals.user._id },
      },
      { new: true }
    );
    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $push: { followings: req.params.id },
      },
      { new: true }
    );
    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};
const unfollow = async (req, res) => {
  // res.locals.user._id
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { followers: res.locals.user._id },
      },
      { new: true }
    );
    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $pull: { followings: req.params.id },
      },
      { new: true }
    );
    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};

// Avatarı güncelle
const updateAvatar = async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.redirect('/users/dashboard');
    }

    const user = await User.findById(res.locals.user._id);
    
    // Eski resmi sil
    if(user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Yeni resmi yükle
    const result = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: 'avatars',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' }
        ]
      }
    );

    user.avatar = {
      url: result.secure_url,
      public_id: result.public_id
    };

    await user.save();
    fs.unlinkSync(req.files.avatar.tempFilePath); // Temp dosyayı sil

    res.redirect('/users/dashboard');

  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({
      succeeded: false,
      error
    });
  }
};

// deleteAvatar controller'ında default path kontrolü
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(res.locals.user._id);
    
    if(user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // Default resim kontrolü
    const defaultAvatar = "/images/profile_1.jpg";
    if(user.avatar.url !== defaultAvatar) {
      user.avatar = {
        url: defaultAvatar,
        public_id: null
      };
      await user.save();
    }

    res.redirect('/users/dashboard');
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error
    });
  }
};

// Bio güncelle
const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;
    
    if (bio && bio.length > 500) {
      return res.status(400).json({
        succeeded: false,
        error: 'Bio cannot exceed 500 characters'
      });
    }

    await User.findByIdAndUpdate(
      res.locals.user._id,
      { bio: bio || '' },
      { new: true, runValidators: true }
    );

    res.redirect('/users/dashboard');
  } catch (error) {
    console.error('Bio update error:', error);
    res.status(500).json({
      succeeded: false,
      error
    });
  }
};

export {
  createUser,
  loginUser,
  getDashboardPage,
  getAllUsers,
  getAUser,
  follow,
  unfollow,
  updateAvatar, 
  deleteAvatar,
  updateBio,
};