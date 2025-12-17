"""
Test OpenAI API Integration
"""
import os
from openai import OpenAI

def test_openai_key():
    """Test if OpenAI API key is valid"""
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        print("[FAIL] OPENAI_API_KEY not found in environment")
        return False

    print(f"[OK] Found API key: {api_key[:20]}...")

    try:
        client = OpenAI(api_key=api_key)

        # Test with a simple completion
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using correct model name
            messages=[
                {"role": "user", "content": "Say 'API test successful' in exactly those words."}
            ],
            max_tokens=20
        )

        result = response.choices[0].message.content
        print(f"[OK] API Response: {result}")
        print(f"[OK] Model used: {response.model}")
        print(f"[OK] Tokens used: {response.usage.total_tokens}")
        return True

    except Exception as e:
        print(f"[FAIL] API Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing OpenAI API Integration...")
    print("-" * 50)
    success = test_openai_key()
    print("-" * 50)
    if success:
        print("[SUCCESS] OpenAI integration is working!")
    else:
        print("[ERROR] OpenAI integration has issues")
