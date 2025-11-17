import React from 'react';
import { CheckCircle2, Cog, FileAudio, FileText } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatTime } from '../../utils/formatters';
import type { JobProgress } from '../../types/transcription.types';

interface ProcessingStatusProps {
  progress: JobProgress;
}

const STEP_ICONS = {
  uploading: Cog,
  processing: Cog,
  extracting: FileAudio,
  transcribing: FileText,
  completed: CheckCircle2,
};

const STEP_LABELS = {
  uploading: 'Uploading',
  processing: 'Processing',
  extracting: 'Extracting Audio',
  transcribing: 'Transcribing',
  completed: 'Completed',
};

export function ProcessingStatus({ progress }: ProcessingStatusProps) {
  const Icon = STEP_ICONS[progress.step as keyof typeof STEP_ICONS] || Cog;
  const stepLabel = STEP_LABELS[progress.step as keyof typeof STEP_LABELS] || progress.step;

  return (
    <div className="card p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {progress.step === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <LoadingSpinner />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{stepLabel}</h3>
          <p className="text-sm text-gray-600 mb-4">
            {progress.message || `${stepLabel}...`}
            {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
              <span className="ml-2 text-gray-500">
                (~ {formatTime(progress.estimatedTimeRemaining)} remaining)
              </span>
            )}
          </p>

          <ProgressBar percentage={progress.percentage} />

          <div className="mt-4 grid grid-cols-4 gap-2">
            {Object.entries(STEP_LABELS).slice(0, -1).map(([key, label], index) => {
              const stepPercentage = index * 25;
              const isActive = progress.percentage >= stepPercentage;
              const isCurrent = progress.step === key;

              return (
                <div key={key} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-2 ring-primary-300' : ''}`}
                  >
                    {React.createElement(STEP_ICONS[key as keyof typeof STEP_ICONS], {
                      className: 'w-4 h-4',
                    })}
                  </div>
                  <p className={`text-xs text-center ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
