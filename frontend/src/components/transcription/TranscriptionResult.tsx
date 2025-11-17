import React, { useState } from 'react';
import { Search, FileText, Copy, CheckCircle } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { copyToClipboard } from '../../utils/formatters';
import { Button } from '../common/Button';
import type { TranscriptionResult as TranscriptionResultType, VideoMetadata } from '../../types/transcription.types';

interface TranscriptionResultProps {
  transcription: TranscriptionResultType;
  videoMetadata?: VideoMetadata;
}

export function TranscriptionResult({ transcription, videoMetadata }: TranscriptionResultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(transcription.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredSegments = searchQuery
    ? transcription.segments.filter((seg) =>
        seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcription.segments;

  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ✨ Transcription Complete!
            </h2>
            {videoMetadata && (
              <p className="text-sm text-gray-600">
                {videoMetadata.originalName} • {formatDuration(videoMetadata.duration)}
              </p>
            )}
          </div>
          <Button onClick={handleCopy} variant="secondary" className="flex items-center gap-2">
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Text
              </>
            )}
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Duration</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatDuration(transcription.duration)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Language</p>
            <p className="text-lg font-semibold text-gray-900">
              {transcription.language.toUpperCase()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Words</p>
            <p className="text-lg font-semibold text-gray-900">
              {transcription.wordCount.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Confidence</p>
            <p className="text-lg font-semibold text-gray-900">
              {Math.round(transcription.overallConfidence * 100)}%
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search in transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Show timestamps</span>
          </label>
        </div>
      </div>

      {/* Transcription Content */}
      <div className="p-6 max-h-96 overflow-y-auto">
        {showTimestamps && filteredSegments.length > 0 ? (
          <div className="space-y-4">
            {filteredSegments.map((segment) => (
              <div key={segment.id} className="flex gap-4">
                <span className="text-sm text-gray-500 font-mono flex-shrink-0">
                  {formatDuration(segment.startTime)}
                </span>
                <p className="text-gray-900 flex-1">{highlightText(segment.text)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {highlightText(transcription.text)}
          </p>
        )}

        {searchQuery && filteredSegments.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
