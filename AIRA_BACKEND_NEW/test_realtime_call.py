"""Test real-time call status updates"""
import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://localhost:8001"

async def test_call_flow():
    """Simulate a complete call flow with status updates"""
    
    print("\n" + "="*60)
    print("REAL-TIME CALL STATUS TEST")
    print("="*60)
    
    # Step 1: Initiate a call
    print("\n📞 Step 1: Initiating call...")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Login first to get token
        try:
            login_response = await client.post(
                f"{BASE_URL}/auth/login",
                json={"email": "admin@aira.com", "password": "admin123"}
            )
            
            if login_response.status_code != 200:
                print(f"❌ Login failed: {login_response.text}")
                print("\nPlease ensure:")
                print("1. Backend is running on http://localhost:8001")
                print("2. Admin user exists with email: admin@aira.com")
                return
            
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ Logged in successfully")
            
        except Exception as e:
            print(f"❌ Connection error: {e}")
            print("\nPlease ensure backend is running on http://localhost:8001")
            return
        
        # Initiate call
        try:
            call_response = await client.post(
                f"{BASE_URL}/calls/initiate",
                json={"phone_number": "+919876543210"},
                headers=headers
            )
            
            if call_response.status_code != 200:
                print(f"❌ Call initiation failed: {call_response.text}")
                return
            
            call_data = call_response.json()
            call_sid = call_data["call_sid"]
            print(f"✅ Call initiated: {call_sid}")
            print(f"   📡 Socket.IO should emit: call:status with status='initiated'")
            print(f"   📡 Socket.IO should emit: call:status with status='ringing'")
            print(f"   👀 Check frontend console for these events!")
            
        except Exception as e:
            print(f"❌ Error initiating call: {e}")
            return
        
        # Wait 3 seconds
        print("\n⏳ Waiting 3 seconds...")
        await asyncio.sleep(3)
        
        # Step 2: Update to connected
        print(f"\n📞 Step 2: Updating to CONNECTED (call answered)...")
        try:
            await client.post(
                f"{BASE_URL}/calls/status",
                json={
                    "call_sid": call_sid,
                    "status": "connected",
                    "phone_number": "+919876543210"
                }
            )
            print("✅ Status updated to: connected")
            print("   📡 Socket.IO should emit: call:status with status='connected'")
            print("   🔄 Frontend should redirect to Call Dashboard now!")
            print("   👀 Check if page redirects automatically!")
        except Exception as e:
            print(f"❌ Error updating status: {e}")
        
        # Wait 5 seconds
        print("\n⏳ Waiting 5 seconds...")
        await asyncio.sleep(5)
        
        # Step 3: Update to ongoing
        print(f"\n📞 Step 3: Updating to ONGOING (conversation in progress)...")
        try:
            await client.post(
                f"{BASE_URL}/calls/status",
                json={
                    "call_sid": call_sid,
                    "status": "ongoing",
                    "phone_number": "+919876543210"
                }
            )
            print("✅ Status updated to: ongoing")
            print("   📡 Socket.IO should emit: call:status with status='ongoing'")
            print("   📊 Call Dashboard should show this call as 'ongoing'")
        except Exception as e:
            print(f"❌ Error updating status: {e}")
        
        # Wait 5 seconds
        print("\n⏳ Waiting 5 seconds...")
        await asyncio.sleep(5)
        
        # Step 4: Update to completed
        print(f"\n📞 Step 4: Updating to COMPLETED (call ended)...")
        try:
            await client.post(
                f"{BASE_URL}/calls/status",
                json={
                    "call_sid": call_sid,
                    "status": "completed",
                    "phone_number": "+919876543210"
                }
            )
            print("✅ Status updated to: completed")
            print("   📡 Socket.IO should emit: call:completed")
            print("   📊 Call should move from active to completed")
            print("   📊 Today's calls count should increase")
        except Exception as e:
            print(f"❌ Error updating status: {e}")
        
        print("\n" + "="*60)
        print("✅ TEST COMPLETED!")
        print("="*60)
        print("\nWhat to check:")
        print("1. Browser console should show Socket.IO events")
        print("2. Make Call page should have redirected to Call Dashboard")
        print("3. Call Dashboard should show updated active calls count")
        print("4. Today's calls count should have increased")
        print("5. All status changes should appear without page refresh")
        print("\nIf you don't see updates:")
        print("- Check browser console for Socket.IO connection (green dot)")
        print("- Check backend terminal for Socket.IO emit logs")
        print("- Verify call_sid matches in both logs")

if __name__ == "__main__":
    print("\n🚀 Starting Real-time Call Status Test...")
    print("\nPrerequisites:")
    print("✓ Backend running on http://localhost:8001")
    print("✓ Frontend running on http://localhost:3000")
    print("✓ Browser open with console visible (F12)")
    print("✓ On Make Call or Call Dashboard page")
    print("\nStarting test in 3 seconds...")
    
    try:
        asyncio.run(asyncio.sleep(3))
        asyncio.run(test_call_flow())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
