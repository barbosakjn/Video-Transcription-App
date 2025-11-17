import React from 'react';
import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Video Transcription App</h1>
            <p className="text-sm text-gray-600">Transcribe any video automatically</p>
          </div>
        </div>
      </div>
    </header>
  );
}
