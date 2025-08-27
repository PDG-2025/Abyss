import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).requestId; // optionnel si un middleware requestId est utilisé
  // ZodError -> 400 + details flatten()
  if (err instanceof ZodError || err?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: (err as ZodError).flatten?.() ?? err,
      requestId,
    });
  }

  // CORS bloqué (levé par la fonction d’origine CORS)
  if (err?.message === 'CORS blocked') {
    return res.status(403).json({
      error: 'Origin non autorisée',
      requestId,
    });
  }

  // Rate limit (message standardisé)
  if (err?.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Too Many Requests',
      details: err.details ?? undefined,
      requestId,
    });
  }

  // Autres erreurs connues avec status
  const status = typeof err?.status === 'number' ? err.status : 500;

  // Journalisation serveur (ne pas exposer stack au client en production)
  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return res.status(status).json({
    error: err?.message || 'Internal Server Error',
    requestId,
  });
}
