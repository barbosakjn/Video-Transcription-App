import { useState, useEffect, useCallback, useRef } from 'react';
import { transcriptionApi } from '../services/api';
import type { JobStatus, ResultResponse } from '../types/transcription.types';

interface UseTranscriptionResult {
  // State
  jobId: string | null;
  status: JobStatus | null;
  result: ResultResponse | null;
  uploadProgress: number;
  error: string | null;
  isUploading: boolean;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;

  // Actions
  startTranscription: (file: File, language?: string) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 2000; // 2 seconds

export function useTranscription(): UseTranscriptionResult {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isUploading = uploadProgress > 0 && uploadProgress < 100 && !jobId;
  const isProcessing =
    status !== null &&
    status.status !== 'completed' &&
    status.status !== 'failed';
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';

  // Poll for status updates
  const pollStatus = useCallback(async (currentJobId: string) => {
    try {
      const statusData = await transcriptionApi.getStatus(currentJobId);
      setStatus(statusData);

      if (statusData.status === 'completed') {
        // Fetch result
        const resultData = await transcriptionApi.getResult(currentJobId);
        setResult(resultData);

        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else if (statusData.status === 'failed') {
        setError(statusData.error?.message || 'Transcription failed');

        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch status:', err);
      setError(err.response?.data?.message || 'Failed to fetch status');

      // Stop polling on error
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, []);

  // Start polling when jobId changes
  useEffect(() => {
    if (jobId && !isCompleted && !isFailed) {
      // Initial fetch
      pollStatus(jobId);

      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollStatus(jobId);
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [jobId, isCompleted, isFailed, pollStatus]);

  const startTranscription = async (file: File, language?: string) => {
    try {
      setError(null);
      setUploadProgress(0);

      const response = await transcriptionApi.uploadVideo(
        file,
        language,
        setUploadProgress
      );

      setJobId(response.jobId);
      setUploadProgress(100);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload video');
      setUploadProgress(0);
    }
  };

  const reset = () => {
    // Clear polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Reset state
    setJobId(null);
    setStatus(null);
    setResult(null);
    setUploadProgress(0);
    setError(null);
  };

  return {
    jobId,
    status,
    result,
    uploadProgress,
    error,
    isUploading,
    isProcessing,
    isCompleted,
    isFailed,
    startTranscription,
    reset,
  };
}
