import fs from 'fs/promises';
import { Job } from 'bull';
import { logger } from '../../utils/logger';
import { extractVideoMetadata } from '../../services/videoMetadata.service';
import { extractAudio } from '../../services/audioExtractor.service';
import { transcribeAudio } from '../../services/transcription.service';
import { updateJob, saveTranscriptionResult } from '../../services/job.service';
import { cleanupJobFiles } from '../../services/cleanup.service';
import { JOB_STATUS, PROGRESS_PERCENTAGES } from '../../utils/constants';
import { ProcessingError } from '../../utils/errors';

export interface TranscriptionJobData {
  jobId: string;
  videoPath: string;
  originalName: string;
  fileSize: number;
  language?: string;
}

export async function processTranscription(job: Job<TranscriptionJobData>): Promise<void> {
  const { jobId, videoPath, originalName, fileSize, language } = job.data;

  logger.info(`Processing transcription job: ${jobId}`);

  try {
    // Step 1: Validate and extract video metadata
    await updateJob(jobId, {
      status: JOB_STATUS.PROCESSING,
      progress: {
        step: 'processing',
        percentage: PROGRESS_PERCENTAGES.UPLOAD_COMPLETE,
        message: 'Validating video...',
      },
    });

    const videoMetadata = await extractVideoMetadata(videoPath, originalName, fileSize);

    await updateJob(jobId, {
      videoMetadata: videoMetadata as any,
      progress: {
        step: 'processing',
        percentage: PROGRESS_PERCENTAGES.VALIDATION_COMPLETE,
        message: 'Video validated successfully',
      },
    });

    job.progress(PROGRESS_PERCENTAGES.VALIDATION_COMPLETE);

    // Step 2: Extract audio
    await updateJob(jobId, {
      status: JOB_STATUS.EXTRACTING,
      progress: {
        step: 'extracting',
        percentage: PROGRESS_PERCENTAGES.EXTRACTION_START,
        message: 'Extracting audio from video...',
      },
    });

    const audioPath = await extractAudio(videoPath, jobId);

    await updateJob(jobId, {
      progress: {
        step: 'extracting',
        percentage: PROGRESS_PERCENTAGES.EXTRACTION_COMPLETE,
        message: 'Audio extracted successfully',
      },
    });

    job.progress(PROGRESS_PERCENTAGES.EXTRACTION_COMPLETE);

    // Cleanup video file after audio extraction
    try {
      await fs.unlink(videoPath);
      logger.info(`Deleted video file: ${videoPath}`);
    } catch (error) {
      logger.warn(`Failed to delete video file: ${videoPath}`);
    }

    // Step 3: Transcribe audio
    await updateJob(jobId, {
      status: JOB_STATUS.TRANSCRIBING,
      progress: {
        step: 'transcribing',
        percentage: PROGRESS_PERCENTAGES.TRANSCRIPTION_START,
        message: 'Starting transcription...',
      },
    });

    const transcription = await transcribeAudio(audioPath, jobId, language);

    job.progress(PROGRESS_PERCENTAGES.TRANSCRIPTION_PROGRESS_MAX);

    // Cleanup audio file after transcription
    try {
      await fs.unlink(audioPath);
      logger.info(`Deleted audio file: ${audioPath}`);
    } catch (error) {
      logger.warn(`Failed to delete audio file: ${audioPath}`);
    }

    // Step 4: Save results
    await updateJob(jobId, {
      progress: {
        step: 'formatting',
        percentage: PROGRESS_PERCENTAGES.FORMATTING,
        message: 'Finalizing transcription...',
      },
    });

    await saveTranscriptionResult(jobId, transcription);

    // Step 5: Mark as completed
    await updateJob(jobId, {
      status: JOB_STATUS.COMPLETED,
      transcription,
      progress: {
        step: 'completed',
        percentage: PROGRESS_PERCENTAGES.COMPLETED,
        message: 'Transcription completed!',
      },
    });

    job.progress(PROGRESS_PERCENTAGES.COMPLETED);

    logger.info(`Transcription job completed: ${jobId}`);

    // Final cleanup
    await cleanupJobFiles(jobId);
  } catch (error: any) {
    logger.error(`Transcription job ${jobId} failed:`, error);

    // Update job with error
    await updateJob(jobId, {
      status: JOB_STATUS.FAILED,
      error: {
        code: error.code || 'PROCESSING_ERROR',
        message: error.message || 'An unknown error occurred',
        details: error.details,
      },
    });

    // Cleanup files
    await cleanupJobFiles(jobId);

    throw error;
  }
}

export function calculateProcessingTime(startTime: Date): number {
  const endTime = new Date();
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}
