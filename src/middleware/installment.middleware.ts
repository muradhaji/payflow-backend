import { Request, Response, NextFunction } from 'express';

import { Installment } from '../models/installment.model';

import { ERROR_MESSAGES } from '../constants/messages';
import { VALIDATION } from '../constants/validation';
import { REGEX } from '../constants/regex';

export const validateInstallmentTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { title } = req.body;

  if (!title) {
    res
      .status(400)
      .json({ message: ERROR_MESSAGES.INSTALLMENT.TITLE_REQUIRED });
    return;
  }

  if (typeof title !== 'string') {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.TITLE_STRING,
    });
    return;
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length < VALIDATION.INSTALLMENT.TITLE_MIN_LENGTH) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.TITLE_MIN_LENGTH,
    });
    return;
  }

  if (trimmedTitle.length > VALIDATION.INSTALLMENT.TITLE_MAX_LENGTH) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.TITLE_MAX_LENGTH,
    });
    return;
  }

  next();
};

export const validateInstallmentAmount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { amount } = req.body;

  if (!amount) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.AMOUNT_REQUIRED,
    });
    return;
  }

  if (typeof amount !== 'number' || isNaN(amount)) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.AMOUNT_NUMBER,
    });
    return;
  }

  if (amount <= VALIDATION.INSTALLMENT.AMOUNT_MIN) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.AMOUNT_POSITIVE,
    });
    return;
  }

  next();
};

export const validateInstallmentMonthCount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { monthCount } = req.body;

  if (!monthCount) {
    res
      .status(400)
      .json({ message: ERROR_MESSAGES.INSTALLMENT.MONTH_COUNT_REQUIRED });
    return;
  }

  if (typeof monthCount !== 'number' || isNaN(monthCount)) {
    res
      .status(400)
      .json({ message: ERROR_MESSAGES.INSTALLMENT.MONTH_COUNT_NUMBER });
    return;
  }

  if (monthCount < VALIDATION.INSTALLMENT.MONTH_COUNT_MIN) {
    res
      .status(400)
      .json({ message: ERROR_MESSAGES.INSTALLMENT.MONTH_COUNT_MIN });
    return;
  }

  next();
};

export const validateInstallmentStartDate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { startDate } = req.body;

  if (!startDate) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.START_DATE_REQUIRED,
    });
    return;
  }

  if (typeof startDate !== 'string') {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.START_DATE_STRING,
    });
    return;
  }

  if (
    !REGEX.INSTALLMENT.START_DATE.test(startDate) ||
    isNaN(Date.parse(startDate))
  ) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.START_DATE_INVALID,
    });
    return;
  }

  next();
};

export const validateMonthlyPayments = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { monthlyPayments, amount, monthCount } = req.body;

  if (!monthlyPayments) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENTS_REQUIRED,
    });
    return;
  }

  if (!Array.isArray(monthlyPayments)) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENTS_ARRAY,
    });
    return;
  }

  if (monthlyPayments.length !== monthCount) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENTS_COUNT_MISMATCH,
    });
    return;
  }

  for (const [index, payment] of monthlyPayments.entries()) {
    if (!payment.date) {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_DATE_REQUIRED,
        index,
      });
      return;
    }

    if (typeof payment.date !== 'string') {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_DATE_STRING,
        index,
      });
      return;
    }

    if (
      !REGEX.INSTALLMENT.MONTHLY_PAYMENT_DATE.test(payment.date) ||
      isNaN(Date.parse(payment.date))
    ) {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_DATE_INVALID,
        index,
      });
      return;
    }

    if (!payment.amount) {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_AMOUNT_REQUIRED,
        index,
      });
      return;
    }

    if (typeof payment.amount !== 'number' || isNaN(payment.amount)) {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_AMOUNT_NUMBER,
        index,
      });
      return;
    }

    if (payment.amount <= VALIDATION.INSTALLMENT.MONTHLY_PAYMENT_AMOUNT_MIN) {
      res.status(400).json({
        message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENT_AMOUNT_POSITIVE,
        index,
      });
      return;
    }
  }

  const total = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

  if (+total.toFixed(2) !== +amount.toFixed(2)) {
    res.status(400).json({
      message: ERROR_MESSAGES.INSTALLMENT.MONTHLY_PAYMENTS_TOTAL_MISMATCH,
    });
    return;
  }

  next();
};

export const checkInstallmentExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  const installment = await Installment.findOne({
    _id: id,
    user: req.user!._id,
  });

  if (!installment) {
    res
      .status(404)
      .json({ message: ERROR_MESSAGES.INSTALLMENT.INSTALLMENT_NOT_FOUND });
    return;
  }

  req.installment = installment;

  next();
};

export const installmentValidationMiddlewares = [
  validateInstallmentTitle,
  validateInstallmentAmount,
  validateInstallmentMonthCount,
  validateInstallmentStartDate,
  validateMonthlyPayments,
];
