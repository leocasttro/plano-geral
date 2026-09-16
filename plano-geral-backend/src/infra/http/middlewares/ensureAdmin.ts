import { Request, Response, NextFunction } from 'express';

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  const perfil = req.user?.perfil?.toUpperCase();
  if (
    perfil !== 'ADMIN' &&
    perfil !== 'GESTOR' &&
    perfil !== 'GESTOR_GEOPROCESSAMENTO'
  ) {
    return res.status(403).json({
      error: 'Acesso permitido apenas para administradores e gestores',
    });
  }

  return next();
}
