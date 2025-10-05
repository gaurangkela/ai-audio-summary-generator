import React from "react";

interface ResultsProps {
  transcription: string;
  summary: string;
  isProcessing: boolean;
}

export default function Results({ transcription, summary, isProcessing }: ResultsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isProcessing) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-xl shadow-black/5 ring-1 ring-slate-700/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-gray-600">Processing your audio...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
      </div>
    );
  }

  if (!transcription && !summary) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Transcription */}
      {transcription && (
        <div className="bg-white rounded-lg shadow-xl shadow-black/5 ring-1 ring-slate-700/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Transcription
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(transcription)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => downloadText(transcription, 'transcription.txt')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{transcription}</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-lg shadow-xl shadow-black/5 ring-1 ring-slate-700/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(summary)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => downloadText(summary, 'summary.txt')}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
