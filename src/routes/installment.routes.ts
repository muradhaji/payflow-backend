import express from 'express';
import { createInstallment } from '../controllers/installment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', protect, createInstallment);

export default router;
