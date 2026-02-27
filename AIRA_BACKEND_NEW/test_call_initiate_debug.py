"""Test call initiation with detailed debugging"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_call_initiate():
    base_url = os.getenv('BASE_URL', 'http://localhost:8001')
    
    print("=" * 80)
    print("🧪 TESTING CALL INITIATION")
    print("=" * 80)
    
    # Step 1: Login
    print("\n1️⃣ Logging in...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            # Try different user credentials
            users_to_try = [
                {"email": "admin@example.com", "password": "admin123"},
                {"email": "recruiter@example.com", "password": "recruiter123"},
                {"email": "hr@example.com", "password": "hr123"},
            ]
            
            token = None
            for user in users_to_try:
                try:
                    login_response = await client.post(
                        f"{base_url}/auth/login",
                        json=user
                    )
                    if login_response.status_code == 200:
                        token = login_response.json()['access_token']
                        print(f"   ✅ Logged in as: {user['email']}")
                        break
                except Exception:
                    continue
            
            if not token:
                print("   ❌ Login failed with all users")
                print("\n💡 Create a user first:")
                print("   python seed_users.py")
                return
            
            # Step 2: Initiate call
            print("\n2️⃣ Initiating call...")
            phone_number = "+919694796480"
            
            call_response = await client.post(
                f"{base_url}/calls/initiate",
                json={"phone_number": phone_number},
                headers={"Authorization": f"Bearer {token}"}
            )
            
            print(f"   Status Code: {call_response.status_code}")
            print(f"   Response: {call_response.text}")
            
            if call_response.status_code == 200:
                data = call_response.json()
                call_sid = data.get('call_sid')
                print(f"\n   ✅ Call initiated!")
                print(f"   📞 Call SID: {call_sid}")
                print(f"   📱 Phone: {data.get('phone_number')}")
                
                # Step 3: Check if call was saved in database
                print("\n3️⃣ Checking database...")
                await asyncio.sleep(2)  # Wait a bit
                
                # Try to fetch the call
                calls_response = await client.get(
                    f"{base_url}/calls?limit=1",
                    headers={"Authorization": f"Bearer {token}"}
                )
                
                if calls_response.status_code == 200:
                    calls_data = calls_response.json()
                    total = calls_data.get('total', 0)
                    calls = calls_data.get('calls', [])
                    
                    print(f"   📊 Total calls in DB: {total}")
                    
                    if calls:
                        latest_call = calls[0]
                        print(f"   📞 Latest call:")
                        print(f"      - ID: {latest_call.get('id')}")
                        print(f"      - Call SID: {latest_call.get('call_sid')}")
                        print(f"      - Phone: {latest_call.get('phone_number')}")
                        print(f"      - Status: {latest_call.get('status')}")
                        print(f"      - Start Time: {latest_call.get('start_time')}")
                        
                        if latest_call.get('call_sid') == call_sid:
                            print(f"\n   ✅ Call successfully saved to database!")
                        else:
                            print(f"\n   ⚠️  Latest call in DB is different")
                    else:
                        print(f"   ❌ No calls found in database")
                else:
                    print(f"   ❌ Failed to fetch calls: {calls_response.status_code}")
                
            else:
                print(f"\n   ❌ Call initiation failed!")
                print(f"   Error: {call_response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 80)
    print("📋 SUMMARY")
    print("=" * 80)
    print("\nIf call was saved to database:")
    print("   ✅ Backend is working correctly")
    print("   ✅ MongoDB connection is good")
    print("   ⚠️  But webhook might not be updating status")
    print("\nIf call was NOT saved:")
    print("   ❌ Check backend logs for errors")
    print("   ❌ Check MongoDB connection")
    print("   ❌ Check if Beanie is initialized properly")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_call_initiate())
