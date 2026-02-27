"""Test making a call right now"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_make_call():
    base_url = os.getenv('BASE_URL', 'http://localhost:8001')
    
    # First, login to get token
    print("🔐 Logging in...")
    async with httpx.AsyncClient() as client:
        login_response = await client.post(
            f"{base_url}/auth/login",
            json={
                "email": "admin@aira.com",
                "password": "admin123"
            }
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return
        
        token = login_response.json()['access_token']
        print(f"✅ Login successful")
        
        # Now make a call
        print("\n📞 Initiating call to +919694796480...")
        
        call_response = await client.post(
            f"{base_url}/calls/initiate",
            json={
                "phone_number": "+919694796480"
            },
            headers={
                "Authorization": f"Bearer {token}"
            }
        )
        
        print(f"\n📊 Response Status: {call_response.status_code}")
        print(f"📦 Response Body:")
        print(call_response.json())
        
        if call_response.status_code == 200:
            data = call_response.json()
            call_sid = data.get('call_sid')
            print(f"\n✅ Call initiated successfully!")
            print(f"   Call SID: {call_sid}")
            print(f"   Phone: {data.get('phone_number')}")
            print(f"\n⏳ Now wait for the call to complete...")
            print(f"   Then check: python check_latest_recording.py")
        else:
            print(f"\n❌ Call initiation failed!")

if __name__ == "__main__":
    asyncio.run(test_make_call())
