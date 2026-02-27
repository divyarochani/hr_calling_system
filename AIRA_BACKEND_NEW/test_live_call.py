"""Test live outbound call with ElevenLabs"""
import requests
import json
import time

# Configuration
BACKEND_URL = "http://localhost:8001"
TEST_PHONE = "+919694796480"  # Aapka test number

print("=" * 70)
print("📞 AIRA Live Call Test")
print("=" * 70)

# Step 1: Login
print("\n🔐 Step 1: Logging in...")
login_response = requests.post(
    f"{BACKEND_URL}/auth/login",
    json={
        "email": "admin@example.com",
        "password": "admin123"
    }
)

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
print(f"✅ Login successful!")

# Step 2: Initiate call
print(f"\n📞 Step 2: Initiating call to {TEST_PHONE}...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

call_response = requests.post(
    f"{BACKEND_URL}/calls/initiate",
    headers=headers,
    json={
        "phone_number": TEST_PHONE
    }
)

if call_response.status_code != 200:
    print(f"❌ Call initiation failed: {call_response.text}")
    exit(1)

call_data = call_response.json()
call_sid = call_data['call_sid']
print(f"✅ Call initiated!")
print(f"   Call SID: {call_sid}")
print(f"   Phone: {call_data['phone_number']}")

print("\n" + "=" * 70)
print("🎉 Call initiated successfully!")
print("=" * 70)
print("\n📱 Check your phone - you should receive a call soon!")
print("\n💡 During the call, the AI agent will:")
print("   1. ✅ Call get_candidate_info (check if you exist)")
print("   2. ✅ Ask screening questions")
print("   3. ✅ Call save_screening_data (save your answers)")
print("   4. ✅ Call end_call_with_summary (at the end)")
print("   5. ✅ Optionally call schedule_callback or request_human_transfer")
print("\n🔍 Watch the backend logs to see tool calls in real-time!")
print("\n⏱️  Waiting 30 seconds for call to complete...")

# Wait and then check call status
time.sleep(30)

print("\n📊 Checking call status...")
calls_response = requests.get(
    f"{BACKEND_URL}/calls/",
    headers=headers
)

if calls_response.status_code == 200:
    calls = calls_response.json()
    if calls['total'] > 0:
        latest_call = calls['calls'][0]
        print(f"\n✅ Latest call found:")
        print(f"   Status: {latest_call['status']}")
        print(f"   Duration: {latest_call.get('duration', 'N/A')} seconds")
        summary = latest_call.get('summary') or 'N/A'
        print(f"   Summary: {summary[:100] if summary != 'N/A' else summary}...")

print("\n" + "=" * 70)
print("✅ Test complete! Check backend logs for tool call details.")
print("=" * 70)
