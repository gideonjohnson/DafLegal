"""
Test if GPT-5.1 model exists
"""
import os
from openai import OpenAI

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("[ERROR] OPENAI_API_KEY not found")
    exit(1)

client = OpenAI(api_key=api_key)

# Test GPT-5.1
print("Testing GPT-5.1...")
try:
    response = client.chat.completions.create(
        model="gpt-5.1",
        messages=[
            {"role": "user", "content": "Say 'GPT-5.1 works' in exactly those words."}
        ],
        max_tokens=20
    )
    print(f"[SUCCESS] GPT-5.1 exists!")
    print(f"Response: {response.choices[0].message.content}")
    print(f"Model used: {response.model}")
except Exception as e:
    print(f"[ERROR] GPT-5.1 test failed: {str(e)}")

    # Test GPT-4o-mini as comparison
    print("\nTesting GPT-4o-mini for comparison...")
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": "Say 'GPT-4o-mini works' in exactly those words."}
            ],
            max_tokens=20
        )
        print(f"[SUCCESS] GPT-4o-mini exists!")
        print(f"Response: {response.choices[0].message.content}")
        print(f"Model used: {response.model}")
    except Exception as e2:
        print(f"[ERROR] GPT-4o-mini also failed: {str(e2)}")
