import { Router } from 'express';
import { uploadSingle } from '../middleware/upload.middleware';
import { uploadRateLimiter } from '../middleware/rateLimit.middleware';
import { validateParams, validateQuery } from '../middleware/validation.middleware';
import { jobIdSchema, exportFormatSchema } from '../validators/transcribe.validator';
import {
  uploadVideo,
  getStatus,
  getResult,
  exportTranscription,
  cancelJob,
} from '../controllers/transcribe.controller';

const router = Router();

// Upload video and start transcription
router.post('/upload', uploadRateLimiter, uploadSingle, uploadVideo);

// Get job status
router.get('/:jobId/status', validateParams(jobIdSchema), getStatus);

// Get transcription result
router.get('/:jobId/result', validateParams(jobIdSchema), getResult);

// Export transcription in different formats
router.get(
  '/:jobId/export',
  validateParams(jobIdSchema),
  validateQuery(exportFormatSchema),
  exportTranscription
);

// Cancel job
router.delete('/:jobId', validateParams(jobIdSchema), cancelJob);

export default router;
