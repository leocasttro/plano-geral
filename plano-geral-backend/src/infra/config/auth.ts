import dotenv from 'dotenv';
import {SignOptions} from 'jsonwebtoken';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado');
}

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'],
};
