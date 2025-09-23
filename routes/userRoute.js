import express from 'express';
import * as userController from '../controllers/userController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';
import multer from 'multer';
import methodOverride from 'method-override';

const router = express.Router();
router.route('/register').post(userController.createUser);
router.route('/login').post(userController.loginUser);
router
  .route('/dashboard')
  .get(authMiddleware.authenticateToken, userController.getDashboardPage);
router
  .route('/')
  .get(authMiddleware.authenticateToken, userController.getAllUsers);
router
  .route('/:id')
  .get(authMiddleware.authenticateToken, userController.getAUser);
  router
  .route('/:id/follow')
  .put(authMiddleware.authenticateToken, userController.follow);
router
  .route('/:id/unfollow')
  .put(authMiddleware.authenticateToken, userController.unfollow);

const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });
  router.use(methodOverride('_method'));
  
export default router;