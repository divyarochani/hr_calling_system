"""Direct test of ElevenLabs API"""
import httpx
import json

# Your credentials
ELEVENLABS_API_KEY = "sk_eed6c1c34e8d1ab8a7a798109b30e7862c616ae6b347c8c3"
AGENT_ID = "agent_8601kh89faxjevvs5e5k983yzmhb"
AGENT_PHONE_NUMBER_ID = "phnum_4601kh9edwxwfzyvg7xkaacbbqrq"
TO_NUMBER = "+919694796480"

print("=" * 70)
print("🧪 Testing ElevenLabs API Directly")
print("=" * 70)

url = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"

headers = {
    "xi-api-key": ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
}

payload = {
    "agent_id": AGENT_ID,
    "agent_phone_number_id": AGENT_PHONE_NUMBER_ID,
    "to_number": TO_NUMBER,
}

print(f"\n📡 Making request to: {url}")
print(f"📋 Payload:")
print(json.dumps(payload, indent=2))

try:
    response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
    
    print(f"\n📊 Response Status: {response.status_code}")
    print(f"📄 Response Body:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        print("\n✅ SUCCESS! Call initiated!")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
