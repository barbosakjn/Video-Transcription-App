import React, { useState } from 'react';
import { Download, FileText, Film } from 'lucide-react';
import { transcriptionApi } from '../../services/api';
import { downloadBlob } from '../../utils/formatters';
import { Button } from '../common/Button';
import type { ExportFormat } from '../../types/transcription.types';

interface ExportButtonsProps {
  jobId: string;
}

const EXPORT_OPTIONS: Array<{ format: ExportFormat; label: string; icon: React.ReactNode }> = [
  { format: 'txt', label: 'Plain Text', icon: <FileText className="w-4 h-4" /> },
  { format: 'srt', label: 'SRT Subtitles', icon: <Film className="w-4 h-4" /> },
  { format: 'vtt', label: 'WebVTT', icon: <Film className="w-4 h-4" /> },
  { format: 'json', label: 'JSON', icon: <FileText className="w-4 h-4" /> },
];

export function ExportButtons({ jobId }: ExportButtonsProps) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setDownloading(format);
      const blob = await transcriptionApi.exportTranscription(jobId, format);
      const filename = `transcription.${format}`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export transcription. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Transcription
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {EXPORT_OPTIONS.map(({ format, label, icon }) => (
          <Button
            key={format}
            onClick={() => handleExport(format)}
            disabled={downloading !== null}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            {downloading === format ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                {icon}
                {label}
              </>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
