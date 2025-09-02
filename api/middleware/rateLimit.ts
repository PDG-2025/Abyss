import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request, Response } from 'express';

const limit = 15 * 60 * 1000000000000;
// Générateur de clé : user_id si connecté, sinon IP sécurisée IPv6
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.user_id;
  // fallback '0.0.0.0' si req.ip est undefined
  const ip = req.ip ?? '0.0.0.0';
  return userId ? `u:${userId}` : `ip:${ipKeyGenerator(ip)}`;
};

// Wrapper pour limiter par IP seulement (IPv6-safe)
const keyGeneratorByIp = (req: Request): string => ipKeyGenerator(req.ip ?? '0.0.0.0');

// Handler JSON
const handler = (_req: Request, res: Response) => {
  const retryAfter = res.getHeader('Retry-After');
  return res.status(429).json({ error: 'Too Many Requests', retryAfter });
};

// Limiteurs
export const limiterGlobal = rateLimit({
  windowMs: limit,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

export const limiterAuth = rateLimit({
  windowMs: limit,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGeneratorByIp,
  handler,
});

export const limiterSync = rateLimit({
  windowMs: limit,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});
