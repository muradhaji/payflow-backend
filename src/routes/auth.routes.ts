import express from 'express';

import { signup, login, deleteMe } from '../controllers/auth.controller';

import {
  protect,
  validateUsername,
  validatePassword,
  checkDuplicateUsername,
  checkUserExists,
} from '../middleware/auth.middleware';

const router = express.Router();

router.post(
  '/signup',
  validateUsername,
  checkDuplicateUsername,
  validatePassword,
  signup
);
router.post(
  '/login',
  validateUsername,
  checkUserExists,
  validatePassword,
  login
);
router.delete('/me', protect, validatePassword, deleteMe);

export default router;
