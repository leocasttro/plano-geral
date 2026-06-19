import { Request } from 'express';

export function getAuthenticatedUser(req: Request): string {
  const usuario = req.user?.nome ?? req.user?.id;

  if (!usuario) {
    throw new Error('Usuário não autenticado');
  }

  return usuario;
}

export function getAuthenticatedUserId(req: Request): string {
  const usuarioId = req.user?.id;

  if (!usuarioId) {
    throw new Error('Usuário não autenticado');
  }

  return usuarioId;
}
