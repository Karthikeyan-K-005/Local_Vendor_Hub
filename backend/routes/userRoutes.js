import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  toggleFavoriteStore,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes for Auth
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes for User Profile and Favorites
router.route('/profile').get(protect, getUserProfile);
router.route('/profile/favorite/:id').put(protect, toggleFavoriteStore);

export default router;