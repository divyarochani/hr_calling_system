"""View call transcripts and details"""
import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import DESCENDING
from datetime import datetime

# MongoDB connection
MONGODB_URI = "mongodb://localhost:27017"
MONGODB_DATABASE = "aira"


async def view_latest_transcript():
    """View the latest call transcript"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    calls_collection = db.calls
    
    # Get latest call with transcript
    call = await calls_collection.find_one(
        {"transcriptText": {"$exists": True, "$ne": None}},
        sort=[("createdAt", DESCENDING)]
    )
    
    if not call:
        print("❌ No calls with transcripts found")
        client.close()
        return
    
    print("=" * 80)
    print("📞 Latest Call Transcript")
    print("=" * 80)
    print(f"\nCall SID: {call.get('callSid')}")
    print(f"Phone: {call.get('phoneNumber')}")
    print(f"Status: {call.get('status')}")
    print(f"Duration: {call.get('duration', 'N/A')} seconds")
    print(f"Date: {call.get('createdAt')}")
    
    if call.get('candidateId'):
        # Get candidate details
        candidates_collection = db.candidates
        candidate = await candidates_collection.find_one({"_id": call.get('candidateId')})
        if candidate:
            print(f"\n👤 Candidate: {candidate.get('candidateName', 'Unknown')}")
            print(f"   Email: {candidate.get('email', 'N/A')}")
            print(f"   Experience: {candidate.get('experienceYears', 'N/A')} years")
    
    print("\n" + "=" * 80)
    print("💬 TRANSCRIPT")
    print("=" * 80)
    print(call.get('transcriptText', 'No transcript available'))
    
    if call.get('summary'):
        print("\n" + "=" * 80)
        print("📝 SUMMARY")
        print("=" * 80)
        print(call.get('summary'))
    
    if call.get('recordingUrl'):
        print("\n" + "=" * 80)
        print("🎙️ RECORDING")
        print("=" * 80)
        print(call.get('recordingUrl'))
    
    print("\n" + "=" * 80)
    client.close()


async def view_all_transcripts():
    """View all call transcripts"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    calls_collection = db.calls
    
    # Get all calls with transcripts
    cursor = calls_collection.find(
        {"transcriptText": {"$exists": True, "$ne": None}},
        sort=[("createdAt", DESCENDING)]
    )
    calls = await cursor.to_list(length=100)
    
    if not calls:
        print("❌ No calls with transcripts found")
        client.close()
        return
    
    print("=" * 80)
    print(f"📞 All Call Transcripts ({len(calls)} calls)")
    print("=" * 80)
    
    for i, call in enumerate(calls, 1):
        print(f"\n{'=' * 80}")
        print(f"Call #{i}")
        print(f"{'=' * 80}")
        print(f"Call SID: {call.get('callSid')}")
        print(f"Phone: {call.get('phoneNumber')}")
        print(f"Status: {call.get('status')}")
        print(f"Duration: {call.get('duration', 'N/A')} seconds")
        print(f"Date: {call.get('createdAt')}")
        
        print(f"\n💬 Transcript:")
        transcript = call.get('transcriptText', 'No transcript')
        lines = transcript.split('\n')
        for line in lines[:10]:  # First 10 lines
            print(f"  {line}")
        if len(lines) > 10:
            print(f"  ... ({len(lines) - 10} more lines)")
        
        if call.get('summary'):
            print(f"\n📝 Summary: {call.get('summary')[:150]}...")
    
    print("\n" + "=" * 80)
    client.close()


async def view_call_by_phone(phone_number: str):
    """View calls for a specific phone number"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DATABASE]
    calls_collection = db.calls
    
    # Get calls for this phone number
    cursor = calls_collection.find(
        {"phoneNumber": phone_number},
        sort=[("createdAt", DESCENDING)]
    )
    calls = await cursor.to_list(length=100)
    
    if not calls:
        print(f"❌ No calls found for {phone_number}")
        client.close()
        return
    
    print("=" * 80)
    print(f"📞 Calls for {phone_number} ({len(calls)} calls)")
    print("=" * 80)
    
    for i, call in enumerate(calls, 1):
        print(f"\n{i}. Call SID: {call.get('callSid')}")
        print(f"   Status: {call.get('status')}")
        print(f"   Duration: {call.get('duration', 'N/A')} seconds")
        print(f"   Date: {call.get('createdAt')}")
        
        if call.get('transcriptText'):
            print(f"   Transcript: Available ({len(call.get('transcriptText'))} chars)")
        
        if call.get('summary'):
            print(f"   Summary: {call.get('summary')[:100]}...")
    
    print("\n" + "=" * 80)
    client.close()


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "all":
            asyncio.run(view_all_transcripts())
        elif sys.argv[1].startswith("+"):
            asyncio.run(view_call_by_phone(sys.argv[1]))
        else:
            print("Usage:")
            print("  python view_transcripts.py          # View latest transcript")
            print("  python view_transcripts.py all      # View all transcripts")
            print("  python view_transcripts.py +91...   # View calls for phone number")
    else:
        asyncio.run(view_latest_transcript())
