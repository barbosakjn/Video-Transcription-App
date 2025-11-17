import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export function validateBody(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation error:', error.errors);
        next(
          new ValidationError('Validation failed', {
            errors: error.errors,
          })
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Params validation error:', error.errors);
        next(
          new ValidationError('Invalid parameters', {
            errors: error.errors,
          })
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Query validation error:', error.errors);
        next(
          new ValidationError('Invalid query parameters', {
            errors: error.errors,
          })
        );
      } else {
        next(error);
      }
    }
  };
}
