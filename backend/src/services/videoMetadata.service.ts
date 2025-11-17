import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { ProcessingError, VideoTooLongError } from '../utils/errors';
import { VideoMetadata } from '../types/job.types';
import path from 'path';

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(config.processing.ffmpegPath);
ffmpeg.setFfprobePath(config.processing.ffprobePath);

export async function extractVideoMetadata(
  filePath: string,
  originalName: string,
  fileSize: number
): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        logger.error('Failed to extract video metadata:', err);
        reject(new ProcessingError('Failed to extract video metadata', err.message));
        return;
      }

      try {
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const duration = metadata.format.duration || 0;

        // Validate duration
        if (duration > config.upload.maxVideoDuration) {
          reject(new VideoTooLongError(config.upload.maxVideoDuration, duration));
          return;
        }

        const videoMetadata: VideoMetadata = {
          filename: path.basename(filePath),
          originalName,
          size: fileSize,
          format: metadata.format.format_name || 'unknown',
          duration,
          resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : undefined,
          fps: videoStream ? eval(videoStream.r_frame_rate || '0') : undefined,
          codec: videoStream?.codec_name,
          uploadedAt: new Date().toISOString(),
        };

        logger.info('Video metadata extracted:', {
          filename: videoMetadata.filename,
          duration: videoMetadata.duration,
          resolution: videoMetadata.resolution,
        });

        resolve(videoMetadata);
      } catch (error) {
        logger.error('Error parsing video metadata:', error);
        reject(new ProcessingError('Failed to parse video metadata'));
      }
    });
  });
}

export async function getAudioDuration(audioPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        logger.error('Failed to get audio duration:', err);
        reject(new ProcessingError('Failed to get audio duration'));
        return;
      }

      resolve(metadata.format.duration || 0);
    });
  });
}
