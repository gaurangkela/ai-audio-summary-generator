import io
import os
import json
from fastapi.testclient import TestClient

from app import app


client = TestClient(app)


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("status") == "healthy"


def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("message") == "Audio Transcription Summary Service"


def test_generate_summary_negative_empty_text():
    # Negative: empty transcription should return error
    payload = {"text": "   "}
    resp = client.post("/generate-summary/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "error" in data
    assert data["error"] == "Transcription text cannot be empty"


def test_generate_summary_positive_mocked(monkeypatch):
    # Positive: mock external OpenRouter HTTP call used by the endpoint
    import app as app_module

    class FakeResponse:
        def json(self):
            return {
                "choices": [
                    {"message": {"content": "This is a mocked summary."}}
                ]
            }

    monkeypatch.setattr(app_module.requests, "post", lambda *a, **k: FakeResponse())

    payload = {"text": "Some transcription text"}
    resp = client.post("/generate-summary/", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data.get("summary") == "This is a mocked summary."


def test_process_audio_negative_non_audio_file():
    # Negative: upload a non-audio file
    files = {"file": ("test.txt", b"not audio", "text/plain")}
    resp = client.post("/process-audio/", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is False
    assert data["error"] == "Please upload a valid audio file"


def test_process_audio_positive_mocked(monkeypatch):
    # Positive: mock transcription and summary to avoid ffmpeg/speech and API
    import app as app_module

    def fake_recognize_flow(*args, **kwargs):
        # Simulate transcription result
        return "hello world transcription"

    # Mock recognizer.recognize_google via module-level usage path
    monkeypatch.setattr(app_module, "recognizer", app_module.recognizer)
    monkeypatch.setattr(app_module.recognizer, "recognize_google", lambda audio: "hello world transcription")
    # Also mock recognizer.record to avoid real audio decoding
    monkeypatch.setattr(app_module.recognizer, "record", lambda source: b"audio-bytes")
    # No-op ambient noise adjustment to avoid accessing real audio source internals
    monkeypatch.setattr(app_module.recognizer, "adjust_for_ambient_noise", lambda source, duration=1: None)

    async def fake_generate_summary_internal(req):
        return {"summary": "mocked summary for: " + req.text}

    monkeypatch.setattr(app_module, "generate_summary_internal", fake_generate_summary_internal)

    # Create a tiny fake wav header so pydub/sr pipeline is bypassed; but since pydub
    # will try to decode, we'll instead directly mock AudioSegment.from_file to avoid ffmpeg
    monkeypatch.setattr(app_module, "AudioSegment", type("_AS", (), {"from_file": staticmethod(lambda p: type("_A", (), {"export": lambda self, path, format: open(path, "wb").write(b"RIFF\x00\x00\x00\x00WAVE")})())}))

    # Mock sr.AudioFile context manager to avoid actual audio parsing
    class FakeAudioFile:
        def __init__(self, path):
            self.path = path
        def __enter__(self):
            return object()
        def __exit__(self, exc_type, exc, tb):
            return False

    monkeypatch.setattr(app_module.sr, "AudioFile", FakeAudioFile)

    # Create a small dummy file payload with audio/* content-type
    files = {"file": ("dummy.wav", b"RIFF0000WAVE", "audio/wav")}
    data = {
        "system_prompt": "You are a helpful assistant that summarizes meetings.",
        "user_prompt": "Focus on actions and decisions."
    }
    resp = client.post("/process-audio/", files=files, data=data)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["transcription"] == "hello world transcription"
    assert data["summary"].startswith("mocked summary for: ")


