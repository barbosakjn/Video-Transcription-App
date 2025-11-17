import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './api/middleware/errorHandler.middleware';
import transcribeRoutes from './api/routes/transcribe.routes';
import healthRoutes from './api/routes/health.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.security.corsOrigin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/transcribe', transcribeRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Video Transcription API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: '/api/health',
      upload: 'POST /api/transcribe/upload',
      status: 'GET /api/transcribe/:jobId/status',
      result: 'GET /api/transcribe/:jobId/result',
      export: 'GET /api/transcribe/:jobId/export?format={txt|srt|vtt|json}',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;
