"""Check latest call recording"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

async def check_latest_recording():
    # Connect to MongoDB
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    # Extract database name from URI or use default
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    print(f"Connecting to: {mongodb_uri}")
    print(f"Database: {db_name}\n")
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    # Get latest call
    call = await db.calls.find_one(
        sort=[('start_time', -1)]
    )
    
    if not call:
        print("❌ No calls found in database")
        return
    
    print("=" * 80)
    print("📞 LATEST CALL")
    print("=" * 80)
    print(f"Call ID: {call.get('_id')}")
    print(f"Call SID: {call.get('call_sid')}")
    print(f"Phone: {call.get('phone_number')}")
    print(f"Status: {call.get('status')}")
    print(f"Start Time: {call.get('start_time')}")
    print(f"End Time: {call.get('end_time')}")
    print(f"Duration: {call.get('duration')} seconds")
    
    print("\n" + "=" * 80)
    print("🎵 RECORDING INFO")
    print("=" * 80)
    
    recording_url = call.get('recording_url')
    if recording_url:
        print(f"✅ Recording URL: {recording_url}")
        
        # Check if it's Azure Blob or ElevenLabs URL
        if 'blob.core.windows.net' in recording_url:
            print("📦 Storage: Azure Blob Storage")
        elif 'elevenlabs' in recording_url:
            print("🔗 Storage: ElevenLabs Direct URL")
        else:
            print("❓ Storage: Unknown")
    else:
        print("❌ No recording URL found")
        print("\n⚠️  Possible reasons:")
        print("   1. Call just completed - recording may still be processing")
        print("   2. Webhook not received yet")
        print("   3. Recording download failed")
    
    print("\n" + "=" * 80)
    print("📝 TRANSCRIPT INFO")
    print("=" * 80)
    
    transcript = call.get('transcript_text')
    summary = call.get('summary')
    
    if transcript:
        print(f"✅ Transcript: {len(transcript)} characters")
        print(f"\nFirst 200 chars:\n{transcript[:200]}...")
    else:
        print("❌ No transcript found")
    
    if summary:
        print(f"\n✅ Summary: {len(summary)} characters")
        print(f"\nSummary:\n{summary[:300]}...")
    else:
        print("❌ No summary found")
    
    # Check local recordings folder
    print("\n" + "=" * 80)
    print("📁 LOCAL RECORDINGS")
    print("=" * 80)
    
    recordings_dir = os.path.join(os.path.dirname(__file__), 'recordings')
    if os.path.exists(recordings_dir):
        files = [f for f in os.listdir(recordings_dir) if f.endswith(('.mp3', '.wav', '.json'))]
        if files:
            print(f"✅ Found {len(files)} files in recordings folder:")
            for f in sorted(files, reverse=True)[:10]:  # Show latest 10
                file_path = os.path.join(recordings_dir, f)
                size = os.path.getsize(file_path)
                print(f"   - {f} ({size:,} bytes)")
        else:
            print("❌ No recording files found in recordings folder")
    else:
        print("❌ Recordings folder doesn't exist")
    
    print("\n" + "=" * 80)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_latest_recording())
