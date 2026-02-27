"""Test new ngrok URL"""
import requests

# IMPORTANT: Replace this with your NEW ngrok URL from terminal
NGROK_URL = input("Enter your new ngrok URL (e.g., https://xyz123.ngrok-free.app): ").strip()

if not NGROK_URL.startswith("http"):
    NGROK_URL = "https://" + NGROK_URL

API_KEY = "ditpq0SBRpRMCi53my-ukVmVcLRynE0I1IpZYyKl0k0"

print("\n" + "=" * 70)
print(f"🔍 Testing: {NGROK_URL}")
print("=" * 70)

# Test 1: Health
print("\n1. Testing /health...")
try:
    response = requests.get(f"{NGROK_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Backend accessible!")
        print(f"   Response: {response.json()}")
    else:
        print(f"   ❌ Failed: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Tool
print("\n2. Testing /calls/tools/get_system_date...")
try:
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    response = requests.post(
        f"{NGROK_URL}/calls/tools/get_system_date",
        headers=headers,
        json={},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Tool working!")
        data = response.json()
        print(f"   Date: {data['current_date']}")
        print(f"   Time: {data['current_time']}")
    else:
        print(f"   ❌ Failed: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 70)
print("📝 Next Steps:")
print("=" * 70)
print("\n1. Copy this URL for ElevenLabs tools:")
print(f"   {NGROK_URL}/calls/tools/[tool_name]")
print("\n2. Update ALL 6 tools in ElevenLabs portal:")
print(f"   - get_candidate_info: {NGROK_URL}/calls/tools/get_candidate_info")
print(f"   - save_screening_data: {NGROK_URL}/calls/tools/save_screening_data")
print(f"   - request_human_transfer: {NGROK_URL}/calls/tools/request_human_transfer")
print(f"   - end_call_with_summary: {NGROK_URL}/calls/tools/end_call_with_summary")
print(f"   - schedule_callback: {NGROK_URL}/calls/tools/schedule_callback")
print(f"   - get_system_date: {NGROK_URL}/calls/tools/get_system_date")
print("\n3. Make a test call from ElevenLabs portal")
print("\n4. Check backend logs for tool calls!")
print("=" * 70)
