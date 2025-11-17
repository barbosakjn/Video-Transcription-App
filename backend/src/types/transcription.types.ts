export interface TranscriptionWord {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface TranscriptionSegment {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  words?: TranscriptionWord[];
}

export interface TranscriptionResult {
  text: string;
  language: string;
  languageConfidence: number;
  duration: number;
  segments: TranscriptionSegment[];
  wordCount: number;
  characterCount: number;
  overallConfidence: number;
}

export interface WhisperResponse {
  text: string;
  language: string;
  duration: number;
  segments?: Array<{
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
    words?: Array<{
      word: string;
      start: number;
      end: number;
      probability: number;
    }>;
  }>;
}

export interface ExportOptions {
  format: 'txt' | 'srt' | 'vtt' | 'json';
  includeTimestamps?: boolean;
  maxLineLength?: number;
}
