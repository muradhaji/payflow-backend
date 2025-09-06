import express from 'express';

import {
  createInstallment,
  deleteInstallment,
  getInstallmentById,
  getInstallments,
  togglePaymentStatus,
  updateInstallment,
} from '../controllers/installment.controller';

import { protect } from '../middleware/auth.middleware';
import {
  checkInstallmentExists,
  installmentValidationMiddlewares,
} from '../middleware/installment.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Installments
 *   description: Installment management
 */

/**
 * @swagger
 * /installments:
 *   post:
 *     summary: Create a new installment
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - monthCount
 *               - startDate
 *               - monthlyPayments
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               monthCount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               monthlyPayments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - date
 *                     - amount
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Installment created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', protect, installmentValidationMiddlewares, createInstallment);

/**
 * @swagger
 * /installments/toggle:
 *   post:
 *     summary: Toggle payment status of monthly payments
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - installmentId
 *                 - paymentId
 *               properties:
 *                 installmentId:
 *                   type: string
 *                 paymentId:
 *                   type: string
 *     responses:
 *       200:
 *         description: Payments toggled successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Installment not found
 */
router.post('/toggle', protect, togglePaymentStatus);

/**
 * @swagger
 * /installments:
 *   get:
 *     summary: Get all installments for the logged-in user
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of installments
 */
router.get('/', protect, getInstallments);

/**
 * @swagger
 * /installments/{id}:
 *   get:
 *     summary: Get a single installment by ID
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Installment found
 *       404:
 *         description: Installment not found
 */
router.get('/:id', protect, checkInstallmentExists, getInstallmentById);

/**
 * @swagger
 * /installments/{id}:
 *   put:
 *     summary: Update an installment
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               monthCount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               monthlyPayments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     amount:
 *                       type: number
 *                     paid:
 *                       type: boolean
 *                     paidDate:
 *                       type: string
 *                       format: date
 *     responses:
 *       200:
 *         description: Installment updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Installment not found
 */
router.put(
  '/:id',
  protect,
  checkInstallmentExists,
  installmentValidationMiddlewares,
  updateInstallment
);

/**
 * @swagger
 * /installments/{id}:
 *   delete:
 *     summary: Delete an installment
 *     tags: [Installments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Installment deleted successfully
 *       404:
 *         description: Installment not found
 */
router.delete('/:id', protect, checkInstallmentExists, deleteInstallment);

export default router;
