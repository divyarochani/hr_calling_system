"""Check all calls in database"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

async def check_all_calls():
    # Connect to MongoDB
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    # Get all calls
    calls = await db.calls.find().sort('start_time', -1).to_list(length=20)
    
    if not calls:
        print("❌ No calls found in database")
        client.close()
        return
    
    print("=" * 100)
    print(f"📞 ALL CALLS (Latest {len(calls)})")
    print("=" * 100)
    
    for i, call in enumerate(calls, 1):
        print(f"\n{i}. Call ID: {call.get('_id')}")
        print(f"   Call SID: {call.get('call_sid')}")
        print(f"   Phone: {call.get('phone_number')}")
        print(f"   Status: {call.get('status')}")
        print(f"   Start: {call.get('start_time')}")
        print(f"   End: {call.get('end_time')}")
        print(f"   Duration: {call.get('duration')} sec")
        
        recording = call.get('recording_url')
        transcript = call.get('transcript_text')
        summary = call.get('summary')
        
        if recording:
            print(f"   🎵 Recording: ✅ {recording[:80]}...")
        else:
            print(f"   🎵 Recording: ❌")
        
        if transcript:
            print(f"   📝 Transcript: ✅ ({len(transcript)} chars)")
        else:
            print(f"   📝 Transcript: ❌")
        
        if summary:
            print(f"   📋 Summary: ✅ ({len(summary)} chars)")
        else:
            print(f"   📋 Summary: ❌")
    
    # Count by status
    print("\n" + "=" * 100)
    print("📊 CALL STATISTICS")
    print("=" * 100)
    
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    
    stats = await db.calls.aggregate(pipeline).to_list(length=None)
    
    for stat in stats:
        print(f"   {stat['_id']}: {stat['count']} calls")
    
    # Check for completed calls with recordings
    completed_with_recording = await db.calls.count_documents({
        "status": "completed",
        "recording_url": {"$exists": True, "$ne": None}
    })
    
    print(f"\n   ✅ Completed calls with recordings: {completed_with_recording}")
    
    print("\n" + "=" * 100)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_all_calls())
