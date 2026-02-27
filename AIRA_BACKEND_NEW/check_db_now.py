"""Check database right now"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db_now():
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    print("=" * 80)
    print("📊 DATABASE CHECK - RIGHT NOW")
    print("=" * 80)
    
    # Get latest 5 calls
    calls = await db.calls.find().sort('_id', -1).limit(5).to_list(length=5)
    
    print(f"\n📞 Latest 5 Calls:\n")
    
    for i, call in enumerate(calls, 1):
        created = call.get('createdAt') or call.get('created_at')
        if created:
            age = datetime.utcnow() - created
            age_str = f"{age.seconds // 60}m {age.seconds % 60}s ago"
        else:
            age_str = "Unknown"
        
        print(f"{i}. ID: {call.get('_id')}")
        print(f"   Call SID: {call.get('callSid') or call.get('call_sid') or 'None'}")
        print(f"   Phone: {call.get('phoneNumber') or call.get('phone_number') or 'None'}")
        print(f"   Status: {call.get('status')}")
        print(f"   Created: {created} ({age_str})")
        print()
    
    # Count calls by date
    print("=" * 80)
    print("📅 Calls by Date (Last 7 Days)")
    print("=" * 80)
    
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=i)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        count = await db.calls.count_documents({
            '$or': [
                {'createdAt': {'$gte': date_start, '$lte': date_end}},
                {'created_at': {'$gte': date_start, '$lte': date_end}}
            ]
        })
        
        date_str = date.strftime('%Y-%m-%d')
        print(f"   {date_str}: {count} calls")
    
    print("\n" + "=" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db_now())
