import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') => 
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(400).json({ success: false, errors: result.error.flatten() });
      return;
    }
    
    // Assign validated/transformed data back to the request or locals
    if (target === 'query') {
      res.locals.validatedQuery = result.data;
    } else {
      req[target] = result.data;
    }
    next();
  };
