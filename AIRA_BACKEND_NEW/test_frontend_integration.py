"""Test frontend integration with backend"""
import requests

BASE_URL = "http://localhost:8001"

print("=" * 70)
print("🔗 Testing Frontend-Backend Integration")
print("=" * 70)

# Test 1: Login
print("\n1️⃣  Testing login...")
try:
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    response.raise_for_status()
    data = response.json()
    token = data["access_token"]
    print(f"✅ Login successful")
    print(f"   Token: {token[:20]}...")
except Exception as e:
    print(f"❌ Login failed: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# Test 2: Get profile
print("\n2️⃣  Testing get profile...")
try:
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    response.raise_for_status()
    user = response.json()
    print(f"✅ Profile retrieved")
    print(f"   Name: {user['name']}")
    print(f"   Email: {user['email']}")
except Exception as e:
    print(f"❌ Get profile failed: {e}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response.text}")
    exit(1)

# Test 3: Get candidates
print("\n3️⃣  Testing get candidates...")
try:
    response = requests.get(f"{BASE_URL}/candidates", headers=headers, params={"limit": 5})
    response.raise_for_status()
    data = response.json()
    print(f"✅ Candidates retrieved")
    print(f"   Total: {data['total']}")
    print(f"   Returned: {len(data['candidates'])}")
    if data['candidates']:
        print(f"   First candidate: {data['candidates'][0].get('phone_number', 'N/A')}")
except Exception as e:
    print(f"❌ Get candidates failed: {e}")
    if hasattr(e, 'response'):
        print(f"   Status: {e.response.status_code}")
        print(f"   Response: {e.response.text}")
    exit(1)

# Test 4: Get calls
print("\n4️⃣  Testing get calls...")
try:
    response = requests.get(f"{BASE_URL}/calls", headers=headers, params={"limit": 5})
    response.raise_for_status()
    data = response.json()
    print(f"✅ Calls retrieved")
    print(f"   Total: {data['total']}")
    print(f"   Returned: {len(data['calls'])}")
except Exception as e:
    print(f"❌ Get calls failed: {e}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response.text}")
    exit(1)

# Test 5: Get stats
print("\n5️⃣  Testing get dashboard stats...")
try:
    response = requests.get(f"{BASE_URL}/candidates/stats", headers=headers)
    response.raise_for_status()
    stats = response.json()
    print(f"✅ Stats retrieved")
    print(f"   Total Candidates: {stats['total_candidates']}")
    print(f"   Interested: {stats['interested_candidates']}")
except Exception as e:
    print(f"❌ Get stats failed: {e}")
    if hasattr(e, 'response'):
        print(f"   Response: {e.response.text}")
    exit(1)

print("\n" + "=" * 70)
print("✅ All tests passed! Frontend integration ready.")
print("=" * 70)
