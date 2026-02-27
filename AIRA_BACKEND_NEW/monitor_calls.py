"""Monitor calls and logs in real-time"""
import asyncio
import sys
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import DESCENDING

# MongoDB connection
MONGODB_URI = "mongodb://localhost:27017"
MONGODB_DATABASE = "aira"

async def monitor_calls():
    """Monitor calls collection for changes"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    calls_collection = db.calls
    
    print("=" * 80)
    print("📞 AIRA Call Monitor - Real-time Call Tracking")
    print("=" * 80)
    print("\n⏳ Watching for new calls and updates...\n")
    
    # Get initial call count
    last_count = await calls_collection.count_documents({})
    last_call_id = None
    
    try:
        while True:
            # Check for new calls
            current_count = await calls_collection.count_documents({})
            
            if current_count > last_count:
                print(f"\n🆕 New call detected! Total calls: {current_count}")
                last_count = current_count
            
            # Get latest call
            latest_call = await calls_collection.find_one(
                {},
                sort=[("createdAt", DESCENDING)]
            )
            
            if latest_call and str(latest_call.get("_id")) != last_call_id:
                last_call_id = str(latest_call.get("_id"))
                
                print("\n" + "=" * 80)
                print(f"📞 Latest Call Update - {datetime.now().strftime('%H:%M:%S')}")
                print("=" * 80)
                print(f"Call SID: {latest_call.get('callSid')}")
                print(f"Phone: {latest_call.get('phoneNumber')}")
                print(f"Status: {latest_call.get('status')}")
                print(f"Type: {latest_call.get('callType')}")
                print(f"Duration: {latest_call.get('duration', 'N/A')} seconds")
                
                if latest_call.get('candidateId'):
                    print(f"Candidate ID: {latest_call.get('candidateId')}")
                
                if latest_call.get('summary'):
                    print(f"\n📝 Summary:")
                    print(f"  {latest_call.get('summary')[:200]}...")
                
                if latest_call.get('transcriptText'):
                    print(f"\n💬 Transcript:")
                    transcript = latest_call.get('transcriptText')
                    lines = transcript.split('\n')[:5]  # First 5 lines
                    for line in lines:
                        print(f"  {line}")
                    if len(transcript.split('\n')) > 5:
                        print("  ...")
                
                if latest_call.get('recordingUrl'):
                    print(f"\n🎙️ Recording: {latest_call.get('recordingUrl')}")
                
                print("=" * 80)
            
            # Wait before next check
            await asyncio.sleep(2)
            
    except KeyboardInterrupt:
        print("\n\n👋 Monitoring stopped")
    finally:
        client.close()


async def show_recent_calls():
    """Show recent calls"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    calls_collection = db.calls
    
    print("\n📊 Recent Calls (Last 5)")
    print("=" * 80)
    
    cursor = calls_collection.find({}).sort("createdAt", DESCENDING).limit(5)
    calls = await cursor.to_list(length=5)
    
    if not calls:
        print("No calls found")
    else:
        for i, call in enumerate(calls, 1):
            print(f"\n{i}. Call SID: {call.get('callSid')}")
            print(f"   Phone: {call.get('phoneNumber')}")
            print(f"   Status: {call.get('status')}")
            print(f"   Duration: {call.get('duration', 'N/A')} seconds")
            if call.get('summary'):
                print(f"   Summary: {call.get('summary')[:100]}...")
    
    print("\n" + "=" * 80)
    client.close()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "recent":
        asyncio.run(show_recent_calls())
    else:
        asyncio.run(monitor_calls())
