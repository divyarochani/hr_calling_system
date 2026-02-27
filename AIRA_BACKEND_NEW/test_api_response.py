"""Test API response to see what frontend is getting"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_api_response():
    base_url = os.getenv('BASE_URL', 'http://localhost:8001')
    
    print("=" * 80)
    print("🧪 TESTING API RESPONSES")
    print("=" * 80)
    
    # Login first
    print("\n1️⃣ Logging in...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        login_response = await client.post(
            f"{base_url}/auth/login",
            json={"email": "admin@example.com", "password": "admin123"}
        )
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: {login_response.status_code}")
            return
        
        token = login_response.json()['access_token']
        print(f"   ✅ Logged in successfully")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test 1: Get all calls
        print("\n2️⃣ Testing GET /calls...")
        try:
            calls_response = await client.get(
                f"{base_url}/calls",
                headers=headers,
                follow_redirects=True
            )
            print(f"   Status: {calls_response.status_code}")
            
            if calls_response.status_code == 200:
                data = calls_response.json()
                print(f"   ✅ Response received")
                print(f"   📊 Total calls: {data.get('total', 0)}")
                print(f"   📦 Calls in response: {len(data.get('calls', []))}")
                
                if data.get('calls'):
                    latest = data['calls'][0]
                    print(f"\n   📞 Latest call:")
                    print(f"      - ID: {latest.get('id')}")
                    print(f"      - Phone: {latest.get('phone_number')}")
                    print(f"      - Status: {latest.get('status')}")
                    print(f"      - Start: {latest.get('start_time')}")
            else:
                print(f"   ❌ Failed: {calls_response.status_code}")
                print(f"   Response: {calls_response.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        # Test 2: Get active calls
        print("\n3️⃣ Testing GET /calls/active...")
        try:
            active_response = await client.get(
                f"{base_url}/calls/active",
                headers=headers,
                follow_redirects=True
            )
            print(f"   Status: {active_response.status_code}")
            
            if active_response.status_code == 200:
                data = active_response.json()
                print(f"   ✅ Response received")
                print(f"   📊 Active calls: {data.get('total', 0)}")
                
                if data.get('calls'):
                    for call in data['calls']:
                        print(f"      - {call.get('phone_number')} ({call.get('status')})")
            else:
                print(f"   ❌ Failed: {active_response.status_code}")
                print(f"   Response: {active_response.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
        
        # Test 3: Get dashboard stats
        print("\n4️⃣ Testing GET /candidates/dashboard-stats...")
        try:
            stats_response = await client.get(
                f"{base_url}/candidates/dashboard-stats",
                headers=headers,
                follow_redirects=True
            )
            print(f"   Status: {stats_response.status_code}")
            
            if stats_response.status_code == 200:
                data = stats_response.json()
                print(f"   ✅ Response received")
                print(f"   📊 Stats:")
                for key, value in data.items():
                    print(f"      - {key}: {value}")
            else:
                print(f"   ❌ Failed: {stats_response.status_code}")
                print(f"   Response: {stats_response.text[:200]}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 80)
    print("📋 SUMMARY")
    print("=" * 80)
    print("\nIf all APIs returned 200:")
    print("   ✅ Backend APIs are working")
    print("   ✅ Data is being returned")
    print("   ⚠️  Check frontend console for errors")
    print("\nIf APIs failed:")
    print("   ❌ Check backend logs")
    print("   ❌ Check authentication")
    print("   ❌ Check CORS settings")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_api_response())
