import { Request, Response, NextFunction } from 'express';

export function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.perfil !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acesso permitido apenas para administradores',
    });
  }

  return next();
}
