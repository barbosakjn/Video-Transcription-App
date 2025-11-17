import app from './app';
import { config, validateConfig } from './config/env.config';
import { logger } from './utils/logger';
import { startCleanupScheduler } from './services/cleanup.service';
import { transcriptionQueue } from './config/queue.config';
import { processTranscription } from './queue/processors/transcription.processor';
import fs from 'fs/promises';

// Validate configuration
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error: any) {
  logger.error('Configuration validation failed:', error.message);
  process.exit(1);
}

// Ensure temp directories exist
async function ensureTempDirectories() {
  try {
    await fs.mkdir(config.storage.tempUploadDir, { recursive: true });
    await fs.mkdir(config.storage.tempAudioDir, { recursive: true });
    await fs.mkdir('logs', { recursive: true });
    logger.info('Temporary directories created/verified');
  } catch (error) {
    logger.error('Failed to create temp directories:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    // Ensure directories exist
    await ensureTempDirectories();

    // Start cleanup scheduler
    startCleanupScheduler();

    // Start worker (process transcription jobs in same process)
    transcriptionQueue.process(config.processing.workerConcurrency, async (job) => {
      logger.info(`Worker processing job ${job.id}`);
      await processTranscription(job);
      return { success: true };
    });
    logger.info(`🔧 Worker started with concurrency: ${config.processing.workerConcurrency}`);

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server started successfully`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 API URL: ${config.apiUrl}`);
      logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
      logger.info(`📊 Redis: ${config.redis.host}:${config.redis.port}`);
      logger.info('');
      logger.info('Available endpoints:');
      logger.info('  POST   /api/transcribe/upload');
      logger.info('  GET    /api/transcribe/:jobId/status');
      logger.info('  GET    /api/transcribe/:jobId/result');
      logger.info('  GET    /api/transcribe/:jobId/export');
      logger.info('  GET    /api/health');
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');

      // Close queue first
      await transcriptionQueue.close();
      logger.info('Queue closed');

      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
