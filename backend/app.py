# -------------------- Imports --------------------
import os
import tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import speech_recognition as sr
from pydub import AudioSegment

# -------------------- Environment Setup --------------------
# Load environment variables from .env file
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")  # API key for OpenRouter

# Initialize speech recognizer
recognizer = sr.Recognizer()

# -------------------- Pydantic Models --------------------
class SummaryRequest(BaseModel):
    text: str
    system_prompt: str = "Summarize the following audio transcription text in a clear and concise manner."
    user_prompt: str = ""

class AudioProcessResponse(BaseModel):
    transcription: str
    summary: str
    success: bool
    error: str = None

# -------------------- FastAPI App Initialization --------------------
app = FastAPI()

# Enable CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (adjust for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Audio Transcription Summary Endpoint --------------------
@app.post("/generate-summary/")
async def generate_summary(request: SummaryRequest):
    # Validate that transcription text is not empty
    if not request.text.strip():
        return {"error": "Transcription text cannot be empty"}

    # Construct message payload for GPT-4o-mini
    messages = [
        {"role": "system", "content": request.system_prompt},
        {
            "role": "user", 
            "content": f"{request.user_prompt}\n\nTranscription Text:\n{request.text}" if request.user_prompt else f"Transcription Text:\n{request.text}"
        },
    ]

    try:
        # Send POST request to OpenRouter API
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-4o-mini",  # Text model for summarization
                "messages": messages,
                "max_tokens": 500,  # Allow longer responses for summaries
            },
        )

        # Parse response JSON
        data = response.json()

        # Handle missing or malformed response
        if "choices" not in data:
            return {"error": data}

        # Extract summary from response
        summary = data["choices"][0]["message"]["content"]
        return {"summary": summary}

    except Exception as e:
        # Catch and return any runtime errors
        return {"error": str(e)}

# -------------------- Audio Processing Endpoint --------------------
@app.post("/process-audio/", response_model=AudioProcessResponse)
async def process_audio(
    file: UploadFile = File(...),
    system_prompt: str = Form(default="Summarize the following audio transcription text in a clear and concise manner."),
    user_prompt: str = Form(default="")
):
    """
    Process audio file: transcribe and generate summary
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            return AudioProcessResponse(
                transcription="",
                summary="",
                success=False,
                error="Please upload a valid audio file"
            )
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Real speech recognition using Google's free API
            # Convert audio to WAV format for better compatibility
            audio = AudioSegment.from_file(temp_file_path)
            wav_path = temp_file_path.replace('.wav', '_converted.wav')
            audio.export(wav_path, format="wav")
            
            # Transcribe audio using Google Speech Recognition
            with sr.AudioFile(wav_path) as source:
                recognizer.adjust_for_ambient_noise(source)
                audio_data = recognizer.record(source)
                            
                try:
                    transcription = recognizer.recognize_google(audio_data)
                except sr.UnknownValueError:
                    return AudioProcessResponse(
                        transcription="",
                        summary="",
                        success=False,
                        error="Could not understand the audio. Please try a clearer recording."
                    )
                except sr.RequestError as e:
                    return AudioProcessResponse(
                        transcription="",
                        summary="",
                        success=False,
                        error=f"Speech recognition service error: {str(e)}"
                    )

            # Clean up converted file
            os.unlink(wav_path)
            
            if not transcription.strip():
                return AudioProcessResponse(
                    transcription="",
                    summary="",
                    success=False,
                    error="No speech detected in the audio file"
                )
            
            # Generate summary using provided prompts
            summary_request = SummaryRequest(text=transcription, system_prompt=system_prompt, user_prompt=user_prompt)
            summary_response = await generate_summary_internal(summary_request)
            
            if "error" in summary_response:
                return AudioProcessResponse(
                    transcription=transcription,
                    summary="",
                    success=False,
                    error=f"Transcription successful but summary failed: {summary_response['error']}"
                )
            
            return AudioProcessResponse(
                transcription=transcription,
                summary=summary_response["summary"],
                success=True
            )
            
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        return AudioProcessResponse(
            transcription="",
            summary="",
            success=False,
            error=f"Processing failed: {str(e)}"
        )

# -------------------- Internal Summary Generation --------------------
async def generate_summary_internal(request: SummaryRequest):
    """Internal function to generate summary (extracted from existing endpoint)"""
    if not request.text.strip():
        return {"error": "Transcription text cannot be empty"}

    messages = [
        {"role": "system", "content": request.system_prompt},
        {
            "role": "user", 
            "content": f"{request.user_prompt}\n\nTranscription Text:\n{request.text}" if request.user_prompt else f"Transcription Text:\n{request.text}"
        },
    ]

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-4o-mini",
                "messages": messages,
                "max_tokens": 500,
            },
        )

        data = response.json()

        if "choices" not in data:
            return {"error": data}

        summary = data["choices"][0]["message"]["content"]
        return {"summary": summary}

    except Exception as e:
        return {"error": str(e)}

# -------------------- Health Check Endpoint --------------------
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "audio-summary-service"}

# -------------------- Root Endpoint --------------------
@app.get("/")
async def root():
    return {"message": "Audio Transcription Summary Service", "version": "1.0.0"}
