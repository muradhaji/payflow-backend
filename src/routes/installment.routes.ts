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
router.post('/toggle', protect, togglePaymentStatus);
router.get('/', protect, getInstallments);
router.get('/:id', protect, getInstallmentById);
router.put('/:id', protect, updateInstallment);
router.delete('/:id', protect, deleteInstallment);

export default router;
