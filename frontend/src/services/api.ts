import axios from 'axios';
import type { UploadResponse, JobStatus, ResultResponse, ExportFormat } from '../types/transcription.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transcriptionApi = {
  // Upload video
  uploadVideo: async (file: File, language?: string, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    if (language) {
      formData.append('language', language);
    }

    const response = await api.post<UploadResponse>('/transcribe/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  // Get job status
  getStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await api.get<JobStatus>(`/transcribe/${jobId}/status`);
    return response.data;
  },

  // Get result
  getResult: async (jobId: string): Promise<ResultResponse> => {
    const response = await api.get<ResultResponse>(`/transcribe/${jobId}/result`);
    return response.data;
  },

  // Export transcription
  exportTranscription: async (jobId: string, format: ExportFormat): Promise<Blob> => {
    const response = await api.get(`/transcribe/${jobId}/export`, {
      params: { format },
      responseType: 'blob',
    });

    return response.data;
  },

  // Cancel job
  cancelJob: async (jobId: string): Promise<void> => {
    await api.delete(`/transcribe/${jobId}`);
  },
};

export default api;
