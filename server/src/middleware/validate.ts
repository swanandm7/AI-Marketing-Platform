import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, z } from 'zod';

/**
 * Returns a middleware that validates req.body against the given Zod schema.
 * On failure it responds with 400 and the list of issues.
 * On success it replaces req.body with the parsed (coerced) value.
 */
export function validateBody<T extends ZodSchema>(
  schema: T,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request body',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    req.body = result.data as z.infer<T>;
    next();
  };
}
