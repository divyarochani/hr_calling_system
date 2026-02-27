"""Check MongoDB data after call test"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime


async def check_data():
    """Check calls and candidates in MongoDB"""
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["aira"]
    
    print("=" * 70)
    print("📊 MONGODB DATA CHECK")
    print("=" * 70)
    
    # Check calls
    calls_collection = db["calls"]
    calls_count = await calls_collection.count_documents({})
    print(f"\n📞 CALLS: {calls_count} total")
    
    if calls_count > 0:
        # Get latest 3 calls
        calls = await calls_collection.find().sort("startTime", -1).limit(3).to_list(length=3)
        for i, call in enumerate(calls, 1):
            print(f"\n  Call #{i}:")
            print(f"    Call SID: {call.get('callSid', 'N/A')}")
            print(f"    Phone: {call.get('phoneNumber', 'N/A')}")
            print(f"    Status: {call.get('status', 'N/A')}")
            print(f"    Candidate ID: {call.get('candidateId', 'N/A')}")
            print(f"    Duration: {call.get('duration', 'N/A')} seconds")
            print(f"    Has Transcript: {'Yes' if call.get('transcriptText') else 'No'}")
            print(f"    Has Summary: {'Yes' if call.get('summary') else 'No'}")
            print(f"    Has Recording: {'Yes' if call.get('recordingUrl') else 'No'}")
            print(f"    Start Time: {call.get('startTime', 'N/A')}")
    
    # Check candidates
    candidates_collection = db["candidates"]
    candidates_count = await candidates_collection.count_documents({})
    print(f"\n\n👤 CANDIDATES: {candidates_count} total")
    
    if candidates_count > 0:
        # Get latest 3 candidates
        candidates = await candidates_collection.find().sort("createdAt", -1).limit(3).to_list(length=3)
        for i, candidate in enumerate(candidates, 1):
            print(f"\n  Candidate #{i}:")
            print(f"    Name: {candidate.get('name', 'N/A')}")
            print(f"    Phone: {candidate.get('phoneNumber', 'N/A')}")
            print(f"    Email: {candidate.get('email', 'N/A')}")
            print(f"    Experience: {candidate.get('experience', 'N/A')} years")
            print(f"    Domain: {candidate.get('domain', 'N/A')}")
            print(f"    Current CTC: {candidate.get('currentCtc', 'N/A')}")
            print(f"    Expected CTC: {candidate.get('expectedCtc', 'N/A')}")
            print(f"    Interest Level: {candidate.get('interestLevel', 'N/A')}")
            print(f"    Callback Requested: {candidate.get('callbackRequested', False)}")
            print(f"    Callback Time: {candidate.get('callbackTime', 'N/A')}")
    
    # Check event logs
    event_logs_collection = db["elevenlabs_event_logs"]
    event_logs_count = await event_logs_collection.count_documents({})
    print(f"\n\n📝 EVENT LOGS: {event_logs_count} total")
    
    if event_logs_count > 0:
        # Get latest 5 events
        events = await event_logs_collection.find().sort("eventTimestamp", -1).limit(5).to_list(length=5)
        for i, event in enumerate(events, 1):
            print(f"\n  Event #{i}:")
            print(f"    Type: {event.get('eventType', 'N/A')}")
            print(f"    Call SID: {event.get('callSid', 'N/A')}")
            print(f"    Status: {event.get('status', 'N/A')}")
            timestamp = event.get('eventTimestamp')
            if timestamp:
                dt = datetime.fromtimestamp(timestamp)
                print(f"    Time: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
    
    print("\n" + "=" * 70)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(check_data())
