"""Clean up stuck calls that are older than 10 minutes"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_stuck_calls():
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    print("=" * 80)
    print("🧹 CLEANING UP STUCK CALLS")
    print("=" * 80)
    
    # Find calls stuck in active states for more than 10 minutes
    cutoff_time = datetime.utcnow() - timedelta(minutes=10)
    
    active_statuses = ['initiated', 'ringing', 'connected', 'ongoing']
    
    # Find stuck calls
    stuck_calls = await db.calls.find({
        'status': {'$in': active_statuses},
        'start_time': {'$lt': cutoff_time}
    }).to_list(length=1000)
    
    print(f"\n📊 Found {len(stuck_calls)} stuck calls (older than 10 minutes)")
    
    if stuck_calls:
        print("\n🔧 Marking as 'failed'...\n")
        
        for call in stuck_calls:
            call_id = call.get('_id')
            phone = call.get('phone_number', 'Unknown')
            status = call.get('status')
            start_time = call.get('start_time')
            
            # Update to failed status
            await db.calls.update_one(
                {'_id': call_id},
                {
                    '$set': {
                        'status': 'failed',
                        'end_time': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            print(f"✅ Updated: {phone} ({status}) - Started: {start_time}")
        
        print(f"\n✅ Cleaned up {len(stuck_calls)} stuck calls")
    else:
        print("\n✅ No stuck calls found - all good!")
    
    # Also clean up calls with no start_time
    no_start_time = await db.calls.find({
        'status': {'$in': active_statuses},
        'start_time': None
    }).to_list(length=1000)
    
    if no_start_time:
        print(f"\n🔧 Found {len(no_start_time)} calls with no start_time")
        print("   Marking as 'failed'...\n")
        
        for call in no_start_time:
            await db.calls.update_one(
                {'_id': call.get('_id')},
                {
                    '$set': {
                        'status': 'failed',
                        'end_time': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                }
            )
        
        print(f"✅ Cleaned up {len(no_start_time)} calls with no start_time")
    
    print("\n" + "=" * 80)
    print("✅ CLEANUP COMPLETE!")
    print("=" * 80)
    print("\n💡 Now refresh your dashboard - Active Calls should be 0")
    print("=" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_stuck_calls())
