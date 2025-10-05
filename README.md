# Audio Summary App

A simple web application that transcribes audio files and generates AI-powered summaries.

## Features

- **Audio Upload**: Upload audio files from your device
- **Audio Recording**: Record audio directly in the browser
- **Transcription**: Server-side speech-to-text using Google Speech Recognition (`speech_recognition` + `pydub`)
- **AI Summary**: Generate intelligent summaries using `gpt-4o-mini` via OpenRouter
- **Export**: Download transcription and summary as text files

## Architecture

- **Frontend**: React + TypeScript (Vite, Tailwind UI)
- **Backend**: FastAPI + Python using Google Speech Recognition for transcription
- **AI**: OpenRouter API for text summarization

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 16+
- FFmpeg (required for audio conversion)
  - Windows: install FFmpeg and ensure `ffmpeg.exe` is on PATH (e.g., `choco install ffmpeg`)
  - macOS: `brew install ffmpeg`
  - Linux (Debian/Ubuntu): `sudo apt-get install ffmpeg`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows (PowerShell):
   .\\venv\\Scripts\\Activate.ps1
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure backend URL (Vite env):
   Create `frontend/.env` with:
   ```
   VITE_BACKEND_URL=http://127.0.0.1:8000
   ```
   In code, read it via `import.meta.env.VITE_BACKEND_URL`.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Usage

1. **Upload Audio**: Click "Choose Audio File" to select an audio file from your device
2. **Record Audio**: Click "Record" to record audio directly in your browser
3. **Process**: Click "Process Audio" to transcribe and summarize
4. **View Results**: See the transcription and AI-generated summary
5. **Export**: Use the copy or download buttons to save results

## Supported Audio Formats

- MP3
- WAV
- M4A
- OGG
- And other common audio formats

## API Endpoints

- `POST /process-audio/` - Process audio file and return transcription + summary
- `POST /generate-summary/` - Generate summary from text
- `GET /health` - Health check

## Development

The frontend is built with:
- React 18
- TypeScript
- Tailwind CSS
- Vite

The backend is built with:
- FastAPI
- SpeechRecognition + PyDub + FFmpeg
- OpenRouter API (gpt-4o-mini)
- Python 3.10+

## Configuration

- Frontend backend URL is configured via Vite env var `VITE_BACKEND_URL` in `frontend/.env`.
- Set `OPENROUTER_API_KEY` in `backend/.env`.

## Security Notes

- Do not expose your OpenRouter API key in the frontend. Keep it in the backend `.env`.
- Configure CORS origins in `backend/app.py` for production.

## Simplified Architecture Benefits

- **Faster Loading**: No client-side ML model downloads
- **Better Performance**: Server-side processing
- **Universal Compatibility**: Works on all devices and browsers
- **Easier Maintenance**: Single processing pipeline
- **Reduced Bundle Size**: Removed ~50MB of ML dependencies
