import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { FileUpload } from '../components/upload/FileUpload';
import { FilePreview } from '../components/upload/FilePreview';
import { UploadProgress } from '../components/upload/UploadProgress';
import { ProcessingStatus } from '../components/transcription/ProcessingStatus';
import { TranscriptionResult } from '../components/transcription/TranscriptionResult';
import { ExportButtons } from '../components/transcription/ExportButtons';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/Button';
import { useTranscription } from '../hooks/useTranscription';

export function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('');

  const {
    jobId,
    status,
    result,
    uploadProgress,
    error,
    isUploading,
    isProcessing,
    isCompleted,
    startTranscription,
    reset,
  } = useTranscription();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleStartTranscription = async () => {
    if (!selectedFile) return;

    await startTranscription(selectedFile, language || undefined);
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setLanguage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Upload Section */}
        {!selectedFile && !isUploading && !isProcessing && !isCompleted && (
          <div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {/* File Preview */}
        {selectedFile && !isUploading && !isProcessing && !isCompleted && (
          <div className="space-y-6">
            <FilePreview file={selectedFile} onRemove={handleRemoveFile} />

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Transcription Settings</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language (Optional)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Auto-detect</option>
                  <option value="en">English</option>
                  <option value="pt">Portuguese</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <Button
                onClick={handleStartTranscription}
                className="w-full"
              >
                ✨ Start Transcription
              </Button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && selectedFile && (
          <UploadProgress progress={uploadProgress} filename={selectedFile.name} />
        )}

        {/* Processing Status */}
        {isProcessing && status && (
          <ProcessingStatus progress={status.progress} />
        )}

        {/* Transcription Result */}
        {isCompleted && result && (
          <div className="space-y-6">
            <TranscriptionResult
              transcription={result.transcription}
              videoMetadata={result.videoMetadata}
            />

            <ExportButtons jobId={result.jobId} />

            <div className="flex justify-center">
              <Button
                onClick={handleReset}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Transcribe Another Video
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
