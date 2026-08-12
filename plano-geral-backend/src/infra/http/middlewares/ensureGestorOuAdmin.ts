import { NextFunction, Request, Response } from 'express';

const PERFIS_GERENCIAIS = ['ADMIN', 'MANAGER', 'GESTOR'];

export function ensureGestorOuAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const perfil = String(req.user?.perfil ?? '').toUpperCase();

  if (!PERFIS_GERENCIAIS.includes(perfil)) {
    return res.status(403).json({
      error: 'Acesso permitido apenas para gestores ou administradores',
    });
  }

  return next();
}
