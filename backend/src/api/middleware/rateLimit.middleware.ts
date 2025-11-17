import rateLimit from 'express-rate-limit';
import { config } from '../../config/env.config';
import { logger } from '../../utils/logger';

export const uploadRateLimiter = rateLimit({
  windowMs: config.rateLimit.window,
  max: config.rateLimit.maxAnonymous,
  message: {
    error: 'Too many requests',
    message: `You have exceeded the ${config.rateLimit.maxAnonymous} requests in ${config.rateLimit.window / 1000 / 60} minutes limit!`,
    retryAfter: config.rateLimit.window / 1000,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !config.rateLimit.enabled,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: `You have exceeded the ${config.rateLimit.maxAnonymous} requests limit. Please try again later.`,
    });
  },
});
