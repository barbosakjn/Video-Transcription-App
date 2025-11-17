import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { HTTP_STATUS } from '../../utils/constants';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.code || 'ERROR',
      message: err.message,
      details: err.details,
    });
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    if (err.message === 'File too large') {
      return res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({
        error: 'FILE_TOO_LARGE',
        message: 'File size exceeds the maximum allowed limit of 2GB',
      });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'UPLOAD_ERROR',
      message: err.message,
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'VALIDATION_ERROR',
      message: err.message,
    });
  }

  // Handle unexpected errors
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.url}`,
  });
}
