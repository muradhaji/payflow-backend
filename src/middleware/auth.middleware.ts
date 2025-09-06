import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import { User } from '../models/user.model';

import { ERROR_MESSAGES } from '../constants/messages';
import { VALIDATION } from '../constants/validation';
import { REGEX } from '../constants/regex';

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: ERROR_MESSAGES.AUTH.TOKEN_NOT_PROVIDED });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      res
        .status(500)
        .json({ message: ERROR_MESSAGES.AUTH.TOKEN_SECRET_MISSING });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: ERROR_MESSAGES.AUTH.USER_NOT_FOUND });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: ERROR_MESSAGES.AUTH.TOKEN_INVALID });
  }
};

export const validateUsername = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username } = req.body;

  if (!username) {
    res.status(400).json({
      message: ERROR_MESSAGES.AUTH.USERNAME_REQUIRED,
    });
    return;
  }

  if (username.length < VALIDATION.AUTH.USERNAME_MIN_LENGTH) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.USERNAME_MIN_LENGTH });
    return;
  }

  if (username.length > VALIDATION.AUTH.USERNAME_MAX_LENGTH) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.USERNAME_MAX_LENGTH });
    return;
  }

  if (!REGEX.AUTH.USERNAME.test(username)) {
    res.status(400).json({
      message: ERROR_MESSAGES.AUTH.USERNAME_INVALID,
    });
    return;
  }

  next();
};

export const validatePassword = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_REQUIRED });
    return;
  }

  if (password.length < VALIDATION.AUTH.PASSWORD_MIN_LENGTH) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_MIN_LENGTH });
    return;
  }

  if (password.length > VALIDATION.AUTH.PASSWORD_MAX_LENGTH) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.PASSWORD_MAX_LENGTH });
    return;
  }

  if (!REGEX.AUTH.PASSWORD.test(password)) {
    res.status(400).json({
      message: ERROR_MESSAGES.AUTH.PASSWORD_INVALID,
    });
    return;
  }

  next();
};

export const checkDuplicateUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username } = req.body;

  const userExists = await User.findOne({ username });

  if (userExists) {
    res.status(400).json({ message: ERROR_MESSAGES.AUTH.USERNAME_EXISTS });
    return;
  }

  next();
};

export const checkUserExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { username } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    res.status(404).json({ message: ERROR_MESSAGES.AUTH.USER_NOT_FOUND });
    return;
  }

  req.user = user;

  next();
};
