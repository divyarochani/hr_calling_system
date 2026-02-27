"""Check if any calls are actually active right now"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

async def check_active_now():
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    # Get calls in active states
    active_statuses = ['initiated', 'ringing', 'connected', 'ongoing']
    active_calls = await db.calls.find({
        'status': {'$in': active_statuses}
    }).to_list(length=100)
    
    print("=" * 80)
    print("📞 ACTIVE CALLS CHECK")
    print("=" * 80)
    
    if not active_calls:
        print("\n❌ No active calls found")
        print("\n💡 This means:")
        print("   - No calls are currently in progress")
        print("   - OR calls are stuck in 'initiated/ringing' state")
        print("   - OR webhook is not updating call status")
    else:
        print(f"\n✅ Found {len(active_calls)} active call(s):\n")
        
        for call in active_calls:
            print(f"Call ID: {call.get('_id')}")
            print(f"Call SID: {call.get('call_sid', 'None')}")
            print(f"Phone: {call.get('phone_number', 'None')}")
            print(f"Status: {call.get('status')}")
            print(f"Started: {call.get('start_time')}")
            
            # Check if call is actually stuck (started more than 10 mins ago)
            start_time = call.get('start_time')
            if start_time:
                age = datetime.utcnow() - start_time
                if age > timedelta(minutes=10):
                    print(f"⚠️  WARNING: Call is {age.seconds // 60} minutes old - might be stuck!")
                else:
                    print(f"✅ Call is {age.seconds} seconds old - looks active")
            print()
    
    print("=" * 80)
    print("🔧 TO FIX:")
    print("=" * 80)
    print("1. Check if ngrok is running")
    print("2. Verify webhook URL in ElevenLabs dashboard")
    print("3. Check backend logs for webhook errors")
    print("4. Test webhook with: python test_socketio_realtime.py")
    print("=" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_active_now())
