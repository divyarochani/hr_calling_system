"""Test if tools are accessible via ngrok"""
import requests

NGROK_URL = "https://autocratic-daina-unridered.ngrok-free.dev"
API_KEY = "ditpq0SBRpRMCi53my-ukVmVcLRynE0I1IpZYyKl0k0"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

print("=" * 70)
print("🔍 Testing Tools via ngrok")
print("=" * 70)

# Test 1: Health check
print("\n1. Testing health endpoint...")
try:
    response = requests.get(f"{NGROK_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Backend accessible via ngrok")
    else:
        print(f"   ❌ Backend not accessible")
except Exception as e:
    print(f"   ❌ Error: {e}")
    print(f"   💡 Start ngrok: ngrok http 8001")

# Test 2: Tool endpoint
print("\n2. Testing get_system_date tool...")
try:
    response = requests.post(
        f"{NGROK_URL}/calls/tools/get_system_date",
        headers=headers,
        json={},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Tool accessible via ngrok")
        print(f"   Response: {response.json()}")
    else:
        print(f"   ❌ Tool not accessible")
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 70)
print("💡 If tests pass, update tool URLs in ElevenLabs portal")
print("=" * 70)
