import express from 'express';
import * as photoController from '../controllers/photoController.js';

const router = express.Router();

router
  .route('/')
  .post(photoController.createPhoto)
  .get(photoController.getAllPhotos);

router
  .route('/:id')
  .get(photoController.getAPhoto)
  .delete(photoController.deletePhoto)
  .put(photoController.updatePhoto);

router.post('/:id/comments', photoController.addComment);
router.put('/:id/comments/:commentId', photoController.editComment);
router.delete('/:id/comments/:commentId', photoController.deleteComment);

router.post('/:id/like', photoController.likePhoto);
router.post('/:id/dislike', photoController.dislikePhoto);

export default router;