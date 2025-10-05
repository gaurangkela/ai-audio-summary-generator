import requests
import json

# Test the audio summary service
def test_summary_service():
    url = "http://localhost:8000/generate-summary/"
    
    # Sample audio transcription text
    transcription_text = """
    Good morning everyone, welcome to today's team meeting. I wanted to discuss our Q4 objectives and the progress we've made so far. 
    First, let's talk about the marketing campaign. Sarah, can you give us an update on the social media engagement? 
    We've seen a 25% increase in engagement compared to last quarter. Great work! 
    Now, regarding the product development, we're on track to release the new feature by the end of this month. 
    The development team has completed 80% of the work. We need to focus on testing and quality assurance. 
    Finally, I want to remind everyone about the client presentation next week. Please prepare your slides by Friday.
    """
    
    # Test data
    data = {
        "text": transcription_text,
        "system_prompt": "Create a concise summary with key points and action items",
        "user_prompt": "Focus on decisions made and next steps"
    }
    
    try:
        response = requests.post(url, json=data)
        result = response.json()
        
        if "summary" in result:
            print("✅ Summary generated successfully!")
            print(f"Summary: {result['summary']}")
        else:
            print("❌ Error occurred:")
            print(json.dumps(result, indent=2))
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_summary_service()
