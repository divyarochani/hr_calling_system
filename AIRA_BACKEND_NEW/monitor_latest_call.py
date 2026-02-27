"""Monitor the latest call in real-time"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime


async def monitor_call():
    """Monitor latest call"""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["aira"]
    
    calls_collection = db["calls"]
    candidates_collection = db["candidates"]
    
    # Get latest call
    call = await calls_collection.find_one(sort=[("startTime", -1)])
    
    if not call:
        print("❌ No calls found")
        return
    
    print("=" * 70)
    print("📞 LATEST CALL")
    print("=" * 70)
    print(f"Call SID: {call.get('callSid')}")
    print(f"Phone: {call.get('phoneNumber')}")
    print(f"Status: {call.get('status')}")
    print(f"Start Time: {call.get('startTime')}")
    print(f"End Time: {call.get('endTime', 'N/A')}")
    print(f"Duration: {call.get('duration', 'N/A')} seconds")
    print(f"Candidate ID: {call.get('candidateId', 'N/A')}")
    print(f"\n📝 Transcript:")
    transcript = call.get('transcriptText', 'N/A')
    if transcript and transcript != 'N/A':
        print(transcript[:500] + "..." if len(transcript) > 500 else transcript)
    else:
        print("  (No transcript yet)")
    
    print(f"\n📊 Summary:")
    summary = call.get('summary', 'N/A')
    if summary and summary != 'N/A':
        print(summary[:300] + "..." if len(summary) > 300 else summary)
    else:
        print("  (No summary yet)")
    
    print(f"\n🎵 Recording URL:")
    print(f"  {call.get('recordingUrl', 'N/A')}")
    
    # Check if candidate was created/updated
    candidate_id = call.get('candidateId')
    if candidate_id:
        from bson import ObjectId
        try:
            candidate = await candidates_collection.find_one({"_id": ObjectId(candidate_id)})
            if candidate:
                print(f"\n👤 CANDIDATE INFO:")
                print(f"  Name: {candidate.get('name', 'N/A')}")
                print(f"  Email: {candidate.get('email', 'N/A')}")
                print(f"  Experience: {candidate.get('experience', 'N/A')} years")
                print(f"  Domain: {candidate.get('domain', 'N/A')}")
                print(f"  Current CTC: {candidate.get('currentCtc', 'N/A')}")
                print(f"  Expected CTC: {candidate.get('expectedCtc', 'N/A')}")
                print(f"  Interest Level: {candidate.get('interestLevel', 'N/A')}")
                print(f"  Callback Requested: {candidate.get('callbackRequested', False)}")
                if candidate.get('callbackTime'):
                    print(f"  Callback Time: {candidate.get('callbackTime')}")
        except Exception as e:
            print(f"  Error fetching candidate: {e}")
    
    print("\n" + "=" * 70)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(monitor_call())
