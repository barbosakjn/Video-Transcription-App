import { TranscriptionResult } from '../types/transcription.types';
import { logger } from '../utils/logger';

export function exportAsText(transcription: TranscriptionResult): string {
  return transcription.text;
}

export function exportAsSRT(transcription: TranscriptionResult): string {
  if (!transcription.segments || transcription.segments.length === 0) {
    return transcription.text;
  }

  let srt = '';

  transcription.segments.forEach((segment, index) => {
    const startTime = formatSRTTimestamp(segment.startTime);
    const endTime = formatSRTTimestamp(segment.endTime);

    srt += `${index + 1}\n`;
    srt += `${startTime} --> ${endTime}\n`;
    srt += `${segment.text.trim()}\n\n`;
  });

  return srt;
}

export function exportAsVTT(transcription: TranscriptionResult): string {
  if (!transcription.segments || transcription.segments.length === 0) {
    return `WEBVTT\n\n${transcription.text}`;
  }

  let vtt = 'WEBVTT\n\n';

  transcription.segments.forEach((segment) => {
    const startTime = formatVTTTimestamp(segment.startTime);
    const endTime = formatVTTTimestamp(segment.endTime);

    vtt += `${startTime} --> ${endTime}\n`;
    vtt += `${segment.text.trim()}\n\n`;
  });

  return vtt;
}

export function exportAsJSON(
  transcription: TranscriptionResult,
  videoMetadata?: any
): string {
  const exportData = {
    videoMetadata: videoMetadata || null,
    transcription: {
      text: transcription.text,
      language: transcription.language,
      languageConfidence: transcription.languageConfidence,
      duration: transcription.duration,
      wordCount: transcription.wordCount,
      characterCount: transcription.characterCount,
      overallConfidence: transcription.overallConfidence,
      segments: transcription.segments.map((seg) => ({
        id: seg.id,
        text: seg.text,
        startTime: seg.startTime,
        endTime: seg.endTime,
        confidence: seg.confidence,
        words: seg.words || [],
      })),
    },
  };

  return JSON.stringify(exportData, null, 2);
}

// SRT timestamp format: 00:00:00,000
function formatSRTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

// VTT timestamp format: 00:00:00.000
function formatVTTTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds
    .toString()
    .padStart(3, '0')}`;
}

export function getContentType(format: string): string {
  const contentTypes: Record<string, string> = {
    txt: 'text/plain',
    srt: 'application/x-subrip',
    vtt: 'text/vtt',
    json: 'application/json',
  };

  return contentTypes[format] || 'text/plain';
}

export function getFileExtension(format: string): string {
  return format;
}
