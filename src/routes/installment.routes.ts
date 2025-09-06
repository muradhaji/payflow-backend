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

router.post('/', protect, installmentValidationMiddlewares, createInstallment);

router.post('/toggle', protect, togglePaymentStatus);

router.get('/', protect, getInstallments);

router.get('/:id', protect, checkInstallmentExists, getInstallmentById);

router.put(
  '/:id',
  protect,
  checkInstallmentExists,
  installmentValidationMiddlewares,
  updateInstallment
);

router.delete('/:id', protect, checkInstallmentExists, deleteInstallment);

export default router;
