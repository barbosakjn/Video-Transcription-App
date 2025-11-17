import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { transcriptionQueue } from '../../config/queue.config';
import { createJob, getJob, getTranscriptionResult } from '../../services/job.service';
import { validateVideoFile } from '../../utils/fileValidation';
import { logger } from '../../utils/logger';
import { HTTP_STATUS } from '../../utils/constants';
import { FileUploadError } from '../../utils/errors';
import {
  exportAsText,
  exportAsSRT,
  exportAsVTT,
  exportAsJSON,
  getContentType,
} from '../../services/export.service';

export async function uploadVideo(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new FileUploadError('No video file provided');
    }

    const { file } = req;
    const jobId = (req as any).jobId;
    const { language } = req.body;

    logger.info(`Video upload received: ${file.originalname}`, {
      jobId,
      size: file.size,
      mimetype: file.mimetype,
    });

    // Validate video file
    await validateVideoFile(file.path, file.size);

    // Create job in database
    const job = await createJob({
      jobId,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    });

    // Add to processing queue
    await transcriptionQueue.add(
      {
        jobId,
        videoPath: file.path,
        originalName: file.originalname,
        fileSize: file.size,
        language,
      },
      {
        jobId,
        timeout: 7200000, // 2 hours
      }
    );

    logger.info(`Job created and added to queue: ${jobId}`);

    res.status(HTTP_STATUS.ACCEPTED).json({
      jobId,
      status: 'uploading',
      message: 'Video upload started',
      filename: file.originalname,
      fileSize: file.size,
    });
  } catch (error) {
    next(error);
  }
}

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;

    const job = await getJob(jobId);

    res.json({
      jobId: job.jobId,
      status: job.status,
      progress: job.progress,
      videoMetadata: job.videoMetadata,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
      error: job.error,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResult(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;

    const job = await getJob(jobId);

    if (job.status !== 'completed') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'JOB_NOT_COMPLETED',
        message: 'Transcription is not yet completed',
        status: job.status,
      });
    }

    const transcription = await getTranscriptionResult(jobId);

    const processingTime = job.completedAt && job.createdAt
      ? Math.floor(
          (new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000
        )
      : 0;

    return res.json({
      jobId: job.jobId,
      status: job.status,
      videoMetadata: job.videoMetadata,
      transcription,
      processingTime,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportTranscription(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const { format } = req.query;

    const job = await getJob(jobId);

    if (job.status !== 'completed') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'JOB_NOT_COMPLETED',
        message: 'Transcription is not yet completed',
      });
    }

    const transcription = await getTranscriptionResult(jobId);

    let content: string;
    let filename: string;

    switch (format) {
      case 'txt':
        content = exportAsText(transcription);
        filename = 'transcription.txt';
        break;

      case 'srt':
        content = exportAsSRT(transcription);
        filename = 'transcription.srt';
        break;

      case 'vtt':
        content = exportAsVTT(transcription);
        filename = 'transcription.vtt';
        break;

      case 'json':
        content = exportAsJSON(transcription, job.videoMetadata);
        filename = 'transcription.json';
        break;

      default:
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'INVALID_FORMAT',
          message: 'Format must be one of: txt, srt, vtt, json',
        });
    }

    res.setHeader('Content-Type', getContentType(format as string));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(content);
  } catch (error) {
    next(error);
  }
}

export async function cancelJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;

    // Remove from queue
    const bullJob = await transcriptionQueue.getJob(jobId);
    if (bullJob) {
      await bullJob.remove();
      logger.info(`Job removed from queue: ${jobId}`);
    }

    // Update job status
    const job = await getJob(jobId);
    if (job.status !== 'completed' && job.status !== 'failed') {
      await import('../../services/job.service').then(({ updateJob }) =>
        updateJob(jobId, {
          status: 'cancelled',
        })
      );
    }

    res.json({
      message: 'Job cancelled successfully',
      jobId,
    });
  } catch (error) {
    next(error);
  }
}
