import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { ProcessingError } from '../utils/errors';

// Set FFmpeg path
ffmpeg.setFfmpegPath(config.processing.ffmpegPath);

export async function extractAudio(videoPath: string, jobId: string): Promise<string> {
  const audioPath = path.join(
    config.storage.tempAudioDir,
    `${jobId}.wav`
  );

  logger.info(`Extracting audio from video: ${videoPath}`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le') // WAV format, 16-bit PCM
      .audioFrequency(16000) // 16kHz sample rate (optimal for speech)
      .audioChannels(1) // Mono channel
      .audioFilters('loudnorm') // Normalize volume
      .output(audioPath)
      .on('start', (commandLine) => {
        logger.debug(`FFmpeg command: ${commandLine}`);
      })
      .on('progress', (progress) => {
        logger.debug(`Audio extraction progress: ${progress.percent?.toFixed(2)}%`);
      })
      .on('end', async () => {
        logger.info(`Audio extracted successfully: ${audioPath}`);

        // Validate audio file
        try {
          const stats = await fs.stat(audioPath);
          if (stats.size === 0) {
            reject(new ProcessingError('Audio extraction failed - empty file'));
            return;
          }

          resolve(audioPath);
        } catch (error) {
          reject(new ProcessingError('Audio file validation failed'));
        }
      })
      .on('error', (err) => {
        logger.error('Audio extraction failed:', err);
        reject(new ProcessingError(`Failed to extract audio: ${err.message}`));
      })
      .run();
  });
}

export async function splitAudioIntoChunks(
  audioPath: string,
  chunkDuration: number = 1200 // 20 minutes in seconds
): Promise<Array<{ path: string; duration: number }>> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, async (err, metadata) => {
      if (err) {
        reject(new ProcessingError('Failed to analyze audio for chunking'));
        return;
      }

      const totalDuration = metadata.format.duration || 0;
      const numChunks = Math.ceil(totalDuration / chunkDuration);
      const chunks: Array<{ path: string; duration: number }> = [];

      try {
        for (let i = 0; i < numChunks; i++) {
          const start = i * chunkDuration;
          const duration = Math.min(chunkDuration, totalDuration - start);
          const chunkPath = audioPath.replace('.wav', `_chunk${i}.wav`);

          await new Promise<void>((resolveChunk, rejectChunk) => {
            ffmpeg(audioPath)
              .setStartTime(start)
              .setDuration(duration)
              .audioCodec('copy')
              .output(chunkPath)
              .on('end', () => {
                logger.info(`Audio chunk ${i + 1}/${numChunks} created`);
                resolveChunk();
              })
              .on('error', (error) => {
                logger.error(`Failed to create audio chunk ${i}:`, error);
                rejectChunk(error);
              })
              .run();
          });

          chunks.push({ path: chunkPath, duration });
        }

        resolve(chunks);
      } catch (error) {
        reject(new ProcessingError('Failed to split audio into chunks'));
      }
    });
  });
}
