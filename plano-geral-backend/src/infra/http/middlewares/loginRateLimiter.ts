import { NextFunction, Request, Response } from 'express';

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, LoginAttempt>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function loginAttemptKey(req: Request): string {
  return `${req.ip}:${String(req.body?.email ?? '').toLowerCase().trim()}`;
}

export function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = loginAttemptKey(req);
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    return res.status(429).json({
      error: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    });
  }

  current.count += 1;
  attempts.set(key, current);

  return next();
}

export function resetLoginRateLimit(req: Request): void {
  attempts.delete(loginAttemptKey(req));
}
