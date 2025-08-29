import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { generateToken } from '../utils/generateToken';

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const userExists = await User.findOne({ username });
  if (userExists) {
    res.status(400).json({ message: 'Username already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id.toString()),
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ message: 'Username not found' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: 'Incorrect password' });
    return;
  }

  res.status(200).json({
    _id: user._id,
    username: user.username,
    token: generateToken(user._id.toString()),
  });
};
