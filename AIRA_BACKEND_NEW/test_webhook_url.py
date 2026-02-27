"""Test if webhook URL is accessible"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_webhook_url():
    base_url = os.getenv('BASE_URL', 'http://localhost:8001')
    webhook_path = '/webhooks/elevenlabs/conversation'
    full_url = f"{base_url}{webhook_path}"
    
    print("=" * 80)
    print("🧪 TESTING WEBHOOK URL")
    print("=" * 80)
    print(f"\n📍 Base URL: {base_url}")
    print(f"📍 Webhook Path: {webhook_path}")
    print(f"📍 Full URL: {full_url}")
    
    # Test 1: Check if base URL is accessible
    print("\n1️⃣ Testing base URL accessibility...")
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(base_url)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Base URL is accessible")
                data = response.json()
                print(f"   📦 Response: {data}")
            else:
                print(f"   ⚠️  Unexpected status: {response.status_code}")
        except httpx.ConnectError:
            print("   ❌ Connection failed - Backend not running or ngrok not working")
            return
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            return
    
    # Test 2: Check if webhook endpoint exists
    print("\n2️⃣ Testing webhook endpoint...")
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Try GET (should fail but tells us endpoint exists)
            response = await client.get(full_url)
            print(f"   Status: {response.status_code}")
            if response.status_code == 405:
                print("   ✅ Webhook endpoint exists (Method Not Allowed is expected for GET)")
            elif response.status_code == 401:
                print("   ✅ Webhook endpoint exists (needs signature)")
            else:
                print(f"   ⚠️  Status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Check ngrok status (if using ngrok)
    if 'ngrok' in base_url:
        print("\n3️⃣ Checking ngrok status...")
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # ngrok provides a local API at 4040
                ngrok_api = await client.get('http://localhost:4040/api/tunnels')
                tunnels = ngrok_api.json()
                
                if tunnels.get('tunnels'):
                    print("   ✅ ngrok is running")
                    for tunnel in tunnels['tunnels']:
                        print(f"   📡 Tunnel: {tunnel['public_url']} -> {tunnel['config']['addr']}")
                else:
                    print("   ⚠️  ngrok running but no tunnels found")
        except Exception as e:
            print(f"   ❌ ngrok not accessible: {str(e)}")
            print("   💡 Make sure ngrok is running: ngrok http 8001")
    
    print("\n" + "=" * 80)
    print("📋 SUMMARY")
    print("=" * 80)
    print("\n✅ If all tests passed:")
    print("   - Your backend is accessible")
    print("   - Webhook endpoint exists")
    print("   - ngrok is working (if used)")
    print("\n❌ If tests failed:")
    print("   - Start backend: python run.py")
    print("   - Start ngrok: ngrok http 8001")
    print("   - Update .env BASE_URL with ngrok URL")
    print("\n🔧 Next step:")
    print("   - Go to ElevenLabs dashboard")
    print(f"   - Set webhook URL to: {full_url}")
    print("   - Make a test call")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(test_webhook_url())
