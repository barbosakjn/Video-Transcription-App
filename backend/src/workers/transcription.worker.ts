import { transcriptionQueue } from '../config/queue.config';
import { processTranscription } from '../queue/processors/transcription.processor';
import { logger } from '../utils/logger';
import { config, validateConfig } from '../config/env.config';
import { startCleanupScheduler } from '../services/cleanup.service';

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error: any) {
  logger.error('Configuration validation failed:', error.message);
  process.exit(1);
}

// Process transcription jobs
transcriptionQueue.process(config.processing.workerConcurrency, async (job) => {
  logger.info(`Worker processing job ${job.id}`);
  await processTranscription(job);
  return { success: true };
});

// Start cleanup scheduler
startCleanupScheduler();

logger.info(`Transcription worker started with concurrency: ${config.processing.workerConcurrency}`);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await transcriptionQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await transcriptionQueue.close();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
