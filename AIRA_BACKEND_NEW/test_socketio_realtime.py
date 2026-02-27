"""Test Socket.IO real-time updates"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_socketio_realtime():
    base_url = os.getenv('BASE_URL', 'http://localhost:8001')
    
    print("=" * 80)
    print("🧪 TESTING SOCKET.IO REAL-TIME UPDATES")
    print("=" * 80)
    
    # Test 1: Check if Socket.IO endpoint is accessible
    print("\n1️⃣ Testing Socket.IO endpoint...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{base_url}/socket.io/")
            print(f"   Status: {response.status_code}")
            if response.status_code in [200, 400]:  # 400 is expected for GET on Socket.IO
                print("   ✅ Socket.IO endpoint is accessible")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Test 2: Test manual event emission
    print("\n2️⃣ Testing manual event emission...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{base_url}/test-socketio")
            data = response.json()
            print(f"   Status: {response.status_code}")
            print(f"   Response: {data}")
            if data.get('success'):
                print(f"   ✅ Event emitted successfully")
                print(f"   📊 Connected clients: {data.get('connected_clients', 0)}")
            else:
                print(f"   ❌ Failed: {data.get('message')}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Test call event emission
    print("\n3️⃣ Testing call event emission...")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{base_url}/test-call-event")
            data = response.json()
            print(f"   Status: {response.status_code}")
            print(f"   Response: {data}")
            if data.get('success'):
                print(f"   ✅ Call event emitted successfully")
                print(f"   📡 Event: call:status")
            else:
                print(f"   ❌ Failed: {data.get('message')}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    print("\n" + "=" * 80)
    print("📋 SUMMARY")
    print("=" * 80)
    print("✅ If all tests passed, Socket.IO is working correctly")
    print("🔌 Frontend should receive real-time updates")
    print("\n💡 To verify in frontend:")
    print("   1. Open browser console (F12)")
    print("   2. Look for Socket.IO connection messages")
    print("   3. Make a call and watch for real-time updates")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_socketio_realtime())
