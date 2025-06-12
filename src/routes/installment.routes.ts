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

const router = express.Router();

router.post('/', protect, createInstallment);
router.get('/', protect, getInstallments);
router.get('/:id', protect, getInstallmentById);
router.put('/:id', protect, updateInstallment);
router.put(
  '/:installmentId/pay/:monthlyPaymentId',
  protect,
  togglePaymentStatus
);
router.delete('/:id', protect, deleteInstallment);

export default router;
