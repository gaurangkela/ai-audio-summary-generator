import React, { useState } from "react";
import AudioUploader from "./components/AudioUploader";
import Results from "./components/Results";

function App() {
    const [transcription, setTranscription] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleAudioProcessed = (transcription: string, summary: string) => {
        setTranscription(transcription);
        setSummary(summary);
        setIsProcessing(false);
        setError("");
    };

    const handleError = (error: string) => {
        setError(error);
        setIsProcessing(false);
    };

    const handleProcessingStart = () => {
        setIsProcessing(true);
        setError("");
        setTranscription("");
        setSummary("");
    };

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-50'>
            <div className='container flex flex-col justify-center items-center max-w-4xl mx-auto p-4'>
                <h1 className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl text-center mb-2'>
                    Audio Summary
                </h1>
                <h2 className='mt-3 mb-8 px-4 text-center text-1xl font-semibold tracking-tight text-slate-600 sm:text-2xl'>
                    Upload audio, get transcription and AI summary
                </h2>
                
                <div className="w-full space-y-6">
                    <AudioUploader 
                        onAudioProcessed={handleAudioProcessed}
                        onError={handleError}
                        isProcessing={isProcessing}
                        onProcessingStart={handleProcessingStart}
                    />
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-800 font-medium">Error: {error}</p>
                            </div>
                        </div>
                    )}
                    
                    <Results 
                        transcription={transcription}
                        summary={summary}
                        isProcessing={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
