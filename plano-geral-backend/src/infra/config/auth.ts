import dotenv from 'dotenv';
import {SignOptions} from 'jsonwebtoken';

dotenv.config();

export const authConfig: {
  jwtSecret: string;
  jwtExpiresIn: SignOptions['expiresIn'];
} = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: (process.env.JWT_EXPIRES_IN || '8h') as SignOptions['expiresIn'],
};
