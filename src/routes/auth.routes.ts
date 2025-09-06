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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error / Duplicate username
 */
router.post(
  '/signup',
  validateUsername,
  checkDuplicateUsername,
  validatePassword,
  signup
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid username
 *       404:
 *         description: User not found
 *       401:
 *         description: Password incorrect
 */
router.post(
  '/login',
  validateUsername,
  checkUserExists,
  validatePassword,
  login
);

/**
 * @swagger
 * /auth/me:
 *   delete:
 *     summary: Delete current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Password required
 *       401:
 *         description: Password incorrect / Unauthorized
 */
router.delete('/me', protect, deleteMe);

export default router;
