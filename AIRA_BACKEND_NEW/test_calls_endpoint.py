"""Test the /calls/ endpoint to verify schema fix"""
import requests

BASE_URL = "http://localhost:8001"

# Login
print("🔐 Logging in...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": "admin@example.com", "password": "admin123"}
)

if login_response.status_code != 200:
    print(f"❌ Login failed: {login_response.text}")
    exit(1)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("✅ Login successful!\n")

# Get calls
print("📞 Fetching calls...")
calls_response = requests.get(
    f"{BASE_URL}/calls/",
    headers=headers,
    params={"limit": 5}
)

if calls_response.status_code != 200:
    print(f"❌ Failed to fetch calls: {calls_response.text}")
    exit(1)

print("✅ Calls fetched successfully!\n")

calls_data = calls_response.json()
print(f"Total calls: {calls_data['total']}")
print(f"\nLatest 5 calls:")
print("=" * 70)

for i, call in enumerate(calls_data['calls'], 1):
    print(f"\n{i}. Call SID: {call['call_sid']}")
    print(f"   Phone: {call['phone_number']}")
    print(f"   Status: {call['status']}")
    print(f"   Duration: {call.get('duration', 'N/A')} seconds")
    print(f"   Has Transcript: {'Yes' if call.get('transcript_text') else 'No'}")
    print(f"   Has Summary: {'Yes' if call.get('summary') else 'No'}")
    print(f"   Has Recording: {'Yes' if call.get('recording_url') else 'No'}")

print("\n" + "=" * 70)
print("✅ Schema validation passed! No errors.")
