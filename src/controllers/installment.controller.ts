import { Request, Response } from 'express';
import { Installment } from '../models/installment.model';

export const createInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, amount, monthCount, startDate, monthlyPayments } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res
        .status(400)
        .json({ message: 'Title is required and must be a non-empty string.' });
      return;
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number.' });
      return;
    }

    if (typeof monthCount !== 'number' || isNaN(monthCount) || monthCount < 1) {
      res
        .status(400)
        .json({ message: 'Month count must be a number greater than 0.' });
      return;
    }

    if (
      !startDate ||
      typeof startDate !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      isNaN(Date.parse(startDate))
    ) {
      res
        .status(400)
        .json({ message: 'Start date must be in YYYY-MM-DD format.' });
      return;
    }

    if (
      !Array.isArray(monthlyPayments) ||
      monthlyPayments.length !== monthCount
    ) {
      res.status(400).json({
        message: `Monthly payments must be an array of length ${monthCount}.`,
      });
      return;
    }

    const invalidPayment = monthlyPayments.find(
      (p) =>
        !p.date ||
        typeof p.amount !== 'number' ||
        p.amount <= 0 ||
        isNaN(Date.parse(p.date))
    );

    if (invalidPayment) {
      res.status(400).json({
        message: 'Each monthly payment must have a valid date and amount',
      });
      return;
    }

    const total = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    if (+total.toFixed(2) !== +amount.toFixed(2)) {
      res.status(400).json({
        message: `Sum of monthly payments (${total.toFixed(
          2
        )}) must equal total amount (${amount.toFixed(2)})`,
      });
      return;
    }

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
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInstallments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const installments = await Installment.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(installments);
  } catch (error) {
    console.error('Get installments error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getInstallmentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const installment = await Installment.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!installment) {
      res.status(404).json({ message: 'Installment not found' });
      return;
    }

    res.status(200).json(installment);
  } catch (error) {
    console.error('Get installment by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, amount, startDate, monthCount, monthlyPayments } = req.body;

    const installment = await Installment.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!installment) {
      res.status(404).json({ message: 'Installment not found' });
      return;
    }

    if (
      startDate &&
      (typeof startDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        isNaN(Date.parse(startDate)))
    ) {
      res
        .status(400)
        .json({ message: 'Start date must be in YYYY-MM-DD format.' });
      return;
    }

    installment.title = title ?? installment.title;
    installment.amount = amount ?? installment.amount;
    installment.monthCount = monthCount ?? installment.monthCount;
    installment.startDate = startDate ?? installment.startDate;
    installment.monthlyPayments =
      monthlyPayments ?? installment.monthlyPayments;

    await installment.save();

    res.status(200).json({ message: 'Installment updated', installment });
  } catch (error) {
    console.error('Update installment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const togglePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { installmentId, monthlyPaymentId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const installment = await Installment.findOne({
      _id: installmentId,
      user: req.user._id,
    });

    if (!installment) {
      res.status(404).json({ message: 'Installment not found' });
      return;
    }

    const payment = installment.monthlyPayments.find(
      (p) => p._id?.toString() === monthlyPaymentId
    );

    if (!payment) {
      res.status(404).json({ message: 'Monthly payment not found' });
      return;
    }

    payment.paid = !payment.paid;
    payment.paidDate = payment.paid ? new Date() : null;

    await installment.save();

    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Toggle payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteInstallment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const installment = await Installment.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!installment) {
      res.status(404).json({ message: 'Installment not found' });
      return;
    }

    res.status(200).json({ message: 'Installment deleted successfully' });
  } catch (error) {
    console.error('Delete installment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
