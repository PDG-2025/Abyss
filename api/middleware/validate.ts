import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';

type Validatable = {
  body?: ZodObject;
  params?: ZodObject;
  query?: ZodObject;
};

export const validate = (schema: ZodObject | Validatable) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Supporte deux styles:
      // 1) schema = z.object({ body, params, query })
      // 2) schema = { body, params, query } (objets Zod)
      const compoundSchema =
        (typeof (schema as any).safeParse === 'function')
          ? (schema as ZodObject)
          : (require('zod') as typeof import('zod')).z.object({
              body: ((schema as Validatable).body ?? (require('zod') as any).z.any()).optional(),
              params: ((schema as Validatable).params ?? (require('zod') as any).z.any()).optional(),
              query: ((schema as Validatable).query ?? (require('zod') as any).z.any()).optional(),
            });

      const result = (compoundSchema as ZodObject).safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        const flattened = result.error.flatten();
        return res.status(400).json({
          error: 'Validation error',
          details: flattened,
        });
      }

      // Écraser les champs par les versions validées (avec defaults/coerce éventuels)
      const parsed = result.data as any;
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params;
      if (parsed.query !== undefined) Object.assign(req.query, parsed.query); 

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: err.flatten(),
        });
      }
      return next(err);
    }
  };
};
