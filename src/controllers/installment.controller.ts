import { Request, Response } from 'express';
import { Installment } from '../models/installment.model';

export const createInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, amount, monthCount, startMonth, monthlyPayments } = req.body;

    if (!title || !amount || !monthCount || !startMonth || !monthlyPayments) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const installment = await Installment.create({
      user: req.user!._id,
      title,
      amount,
      monthCount,
      startMonth,
      monthlyPayments,
    });

    res.status(201).json(installment);
  } catch (error) {
    console.error('Create installment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
