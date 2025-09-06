import { Request, Response } from 'express';
import {
  IInstallment,
  Installment,
  IPaymentUpdate,
} from '../models/installment.model';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';

export const createInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, amount, monthCount, startDate, monthlyPayments } = req.body;

    const installment = await Installment.create({
      user: req.user!._id,
      title,
      amount,
      monthCount,
      startDate,
      monthlyPayments,
    });

    res.status(201).json(installment);
  } catch (error) {
    console.error('Create installment error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};

export const getInstallments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const installments = await Installment.find({ user: req.user?._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(installments);
  } catch (error) {
    console.error('Get installments error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};

export const getInstallmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.status(200).json(req.installment);
  } catch (error) {
    console.error('Get installment by ID error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};

export const updateInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, amount, startDate, monthCount, monthlyPayments } = req.body;

    const installment = req.installment!;

    installment.title = title;
    installment.amount = amount;
    installment.monthCount = monthCount;
    installment.startDate = startDate;
    installment.monthlyPayments = monthlyPayments;

    await installment.save();

    res.status(200).json(installment);
  } catch (error) {
    console.error('Update installment error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};

export const togglePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payments = req.body as IPaymentUpdate[];

    if (!Array.isArray(payments) || payments.length === 0) {
      res
        .status(400)
        .json({ message: ERROR_MESSAGES.INSTALLMENT.UPDATE_PAYMENTS_ARRAY });
      return;
    }

    const responseInstallments: IInstallment[] = [];

    const paymentsByInstallment = payments.reduce((acc, payment) => {
      if (!acc[payment.installmentId]) {
        acc[payment.installmentId] = [];
      }
      acc[payment.installmentId].push(payment.paymentId);
      return acc;
    }, {} as Record<string, string[]>);

    for (const [installmentId, paymentIds] of Object.entries(
      paymentsByInstallment
    )) {
      const installment = await Installment.findOne({
        _id: installmentId,
        user: req.user?._id,
      });

      if (!installment) continue;

      for (const monthlyPayment of installment.monthlyPayments) {
        if (paymentIds.includes(monthlyPayment._id?.toString() ?? '')) {
          monthlyPayment.paid = !monthlyPayment.paid;
          monthlyPayment.paidDate = monthlyPayment.paid ? new Date() : null;
        }
      }

      await installment.save();
      responseInstallments.push(installment);
    }

    res.status(200).json(responseInstallments);
  } catch (error) {
    console.error('Toggle payments error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};

export const deleteInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await Installment.deleteOne({
      _id: req.installment!._id,
      user: req.user?._id,
    });

    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.INSTALLMENT.INSTALLMENT_DELETED });
  } catch (error) {
    console.error('Delete installment error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};
