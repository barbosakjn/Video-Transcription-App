import OpenAI from 'openai';
import fs from 'fs';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';
import { TranscriptionError } from '../utils/errors';
import {
  TranscriptionResult,
  TranscriptionSegment,
  WhisperResponse,
} from '../types/transcription.types';
import { splitAudioIntoChunks } from './audioExtractor.service';

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (Whisper API limit)

export async function transcribeAudio(
  audioPath: string,
  jobId: string,
  language?: string
): Promise<TranscriptionResult> {
  try {
    logger.info(`Starting transcription for job ${jobId}`);

    // Check audio file size
    const stats = await fs.promises.stat(audioPath);
    const audioSize = stats.size;

    logger.info(`Audio file size: ${audioSize} bytes`);

    let transcriptionResult: TranscriptionResult;

    if (audioSize > MAX_AUDIO_SIZE) {
      logger.info(`Audio file exceeds ${MAX_AUDIO_SIZE} bytes, splitting into chunks`);
      transcriptionResult = await transcribeLargeAudio(audioPath, jobId, language);
    } else {
      transcriptionResult = await transcribeSmallAudio(audioPath, language);
    }

    logger.info(`Transcription completed for job ${jobId}`, {
      wordCount: transcriptionResult.wordCount,
      language: transcriptionResult.language,
      confidence: transcriptionResult.overallConfidence,
    });

    return transcriptionResult;
  } catch (error: any) {
    logger.error(`Transcription failed for job ${jobId}:`, error);
    throw new TranscriptionError(
      `Failed to transcribe audio: ${error.message}`,
      { jobId, originalError: error.message }
    );
  }
}

async function transcribeSmallAudio(
  audioPath: string,
  language?: string
): Promise<TranscriptionResult> {
  const audioFile = fs.createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: language || undefined, // Auto-detect if not specified
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
  });

  return processWhisperResponse(response as unknown as WhisperResponse);
}

async function transcribeLargeAudio(
  audioPath: string,
  jobId: string,
  language?: string
): Promise<TranscriptionResult> {
  // Split audio into 20-minute chunks
  const chunks = await splitAudioIntoChunks(audioPath, 1200);

  logger.info(`Audio split into ${chunks.length} chunks`);

  const allSegments: TranscriptionSegment[] = [];
  let fullText = '';
  let currentOffset = 0;
  let detectedLanguage = '';

  for (let i = 0; i < chunks.length; i++) {
    logger.info(`Transcribing chunk ${i + 1}/${chunks.length}`);

    const audioFile = fs.createReadStream(chunks[i].path);

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language || detectedLanguage || undefined,
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
    });

    const whisperResponse = response as unknown as WhisperResponse;

    // Store detected language from first chunk
    if (i === 0) {
      detectedLanguage = whisperResponse.language;
    }

    // Adjust timestamps with offset
    if (whisperResponse.segments) {
      const adjustedSegments = whisperResponse.segments.map((seg, index) => ({
        id: allSegments.length + index,
        text: seg.text,
        startTime: seg.start + currentOffset,
        endTime: seg.end + currentOffset,
        confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.9,
        words: seg.words?.map((word) => ({
          word: word.word,
          startTime: word.start + currentOffset,
          endTime: word.end + currentOffset,
          confidence: word.probability || 0.9,
        })),
      }));

      allSegments.push(...adjustedSegments);
    }

    fullText += whisperResponse.text + ' ';
    currentOffset += chunks[i].duration;

    // Cleanup chunk file
    try {
      await fs.promises.unlink(chunks[i].path);
    } catch (error) {
      logger.warn(`Failed to delete chunk file: ${chunks[i].path}`);
    }
  }

  const result: TranscriptionResult = {
    text: fullText.trim(),
    language: detectedLanguage,
    languageConfidence: 0.95,
    duration: currentOffset,
    segments: allSegments,
    wordCount: fullText.trim().split(/\s+/).filter(Boolean).length,
    characterCount: fullText.trim().length,
    overallConfidence: calculateOverallConfidence(allSegments),
  };

  return result;
}

function processWhisperResponse(response: WhisperResponse): TranscriptionResult {
  const segments: TranscriptionSegment[] =
    response.segments?.map((seg, index) => ({
      id: index,
      text: seg.text,
      startTime: seg.start,
      endTime: seg.end,
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.9,
      words: seg.words?.map((word) => ({
        word: word.word,
        startTime: word.start,
        endTime: word.end,
        confidence: word.probability || 0.9,
      })),
    })) || [];

  return {
    text: response.text,
    language: response.language,
    languageConfidence: 0.95,
    duration: response.duration,
    segments,
    wordCount: response.text.split(/\s+/).filter(Boolean).length,
    characterCount: response.text.length,
    overallConfidence: calculateOverallConfidence(segments),
  };
}

function calculateOverallConfidence(segments: TranscriptionSegment[]): number {
  if (!segments || segments.length === 0) return 0.9;

  const totalConfidence = segments.reduce((sum, seg) => sum + seg.confidence, 0);
  return totalConfidence / segments.length;
}
