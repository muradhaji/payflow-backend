import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { User } from '../models/user.model';
import { Installment } from '../models/installment.model';

import { generateToken } from '../utils/generateToken';

import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id.toString()),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;

  const isMatch = await bcrypt.compare(password, req.user!.password);

  if (!isMatch) {
    res.status(401).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_INCORRECT });
    return;
  }

  res.status(200).json({
    _id: req.user!._id,
    username: req.user!.username,
    token: generateToken(req.user!._id.toString()),
  });
};

export const deleteMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED });
      return;
    }

    const isMatch = await bcrypt.compare(password, req.user!.password);
    if (!isMatch) {
      res.status(401).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_INCORRECT });
      return;
    }

    await Installment.deleteMany({ user: req.user!._id });

    await User.findByIdAndDelete(req.user!._id);

    res.status(200).json({ message: SUCCESS_MESSAGES.AUTH.USER_DELETED });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: ERROR_MESSAGES.UNKNOWN });
  }
};
