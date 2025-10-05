import React, { useState, useRef } from "react";
import AudioRecorder from "./AudioRecorder";

interface AudioUploaderProps {
  onAudioProcessed: (transcription: string, summary: string) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  onProcessingStart: () => void;
}

export default function AudioUploader({ onAudioProcessed, onError, isProcessing, onProcessingStart }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    "Summarize the following audio transcription text in a clear and concise manner."
  );
  const [userPrompt, setUserPrompt] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      setAudioUrl(URL.createObjectURL(file));
      onError("")
    } else {
      onError("Please select a valid audio file");
    }
  };

  const handleRecordingComplete = (blob: Blob) => {
    const file = new File([blob], "recording.wav", { type: blob.type });
    setSelectedFile(file);
    setAudioUrl(URL.createObjectURL(blob));
  };

  const processAudio = async () => {
    if (!selectedFile) return;

    onProcessingStart();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('system_prompt', systemPrompt);
      formData.append('user_prompt', userPrompt);

      const baseUrl = import.meta.env.VITE_BACKEND_URL as string;
      const response = await fetch(`${baseUrl}/process-audio/`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onAudioProcessed(result.transcription, result.summary);
      } else {
        onError(result.error || 'Processing failed');
      }
    } catch (error) {
      onError('Network error: ' + (error as Error).message);
    }
  };

  const resetAudio = () => {
    setSelectedFile(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col justify-center items-center rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10 p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Upload or Record Audio
      </h2>

      <div className="flex flex-col space-y-4 w-full max-w-md">
        {/* Prompts */}
        <div className="flex flex-col space-y-2 w-full">
          <label className="text-sm font-medium text-slate-700">System Prompt</label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <label className="text-sm font-medium text-slate-700">User Prompt (optional)</label>
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Focus on actions and decisions"
          />
        </div>
        {/* File Upload */}
        <div className="flex flex-col items-center space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose Audio File
          </label>
        </div>

        {/* Recording */}
        <div className="flex flex-col items-center space-y-2">
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Selected:</strong> {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && (
          <div className="w-full">
            <audio controls className="w-full">
              <source src={audioUrl} type={selectedFile?.type || 'audio/wav'} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={processAudio}
            disabled={!selectedFile || isProcessing}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Process Audio'
            )}
          </button>

          <button
            onClick={resetAudio}
            disabled={!selectedFile || isProcessing}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
