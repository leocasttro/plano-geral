import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {authConfig} from '../../config/auth';

type JwtPayload = {
  sub: string;
  perfil: string;
};

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;

    req.user = {
      id: decoded.sub,
      perfil: decoded.perfil,
    };

    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}
