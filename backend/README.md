# Audio Transcription Summary Service

This service processes uploaded audio files to produce a transcription and an AI-generated summary, and can also generate summaries from raw text using the OpenRouter API.

## Features

- Upload audio and receive transcription + AI summary
- Generate intelligent summaries from text using `gpt-4o-mini` via OpenRouter
- Customizable system and user prompts
- CORS enabled for frontend integration
- Health check endpoint

## Prerequisites

- Python 3.10+
- FFmpeg (required by `pydub`/`speech_recognition` for audio conversion)
  - Windows: install FFmpeg and ensure `ffmpeg.exe` is on PATH (e.g., via `choco install ffmpeg`)
  - macOS: `brew install ffmpeg`
  - Linux (Debian/Ubuntu): `sudo apt-get install ffmpeg`

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your OpenRouter API key:
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

3. Run the service:
```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### POST /process-audio/
Process an uploaded audio file, returning transcription and summary.

Request (multipart/form-data):
```
file: <audio file>
```

Response (JSON):
```json
{
  "transcription": "Recognized speech",
  "summary": "AI-generated summary",
  "success": true,
  "error": null
}
```

Notes:
- Accepts common audio types (e.g., wav, mp3, m4a, ogg); audio is converted to WAV internally for recognition.
- Speech-to-text uses Google Speech Recognition via the `speech_recognition` package.

### POST /generate-summary/
Generates a summary from plain text.

**Request Body (JSON):**
```json
{
  "text": "Your audio transcription text here",
  "system_prompt": "Custom system prompt (optional)",
  "user_prompt": "Additional user instructions (optional)"
}
```

**Response:**
```json
{
  "summary": "Generated summary text"
}
```

### GET /health
Health check endpoint.

### GET /
Service information endpoint.

## Usage Example

```bash
# Text-to-Summary
curl -X POST "http://localhost:8000/generate-summary/" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your audio transcription text here",
    "system_prompt": "Create a bullet-point summary",
    "user_prompt": "Focus on key decisions and action items"
  }'

# Audio Processing
curl -X POST "http://localhost:8000/process-audio/" \
  -H "Accept: application/json" \
  -F "file=@/path/to/audio.wav"
```
