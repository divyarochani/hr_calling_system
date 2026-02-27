"""Check users in database"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_users():
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/aira')
    if '/' in mongodb_uri:
        db_name = mongodb_uri.split('/')[-1] or 'aira'
    else:
        db_name = os.getenv('MONGODB_DATABASE', 'aira')
    
    client = AsyncIOMotorClient(mongodb_uri)
    db = client[db_name]
    
    users = await db.users.find().to_list(length=100)
    
    if not users:
        print("❌ No users found in database")
        print("\n💡 Run this to create a user:")
        print("   python seed_users.py")
    else:
        print(f"✅ Found {len(users)} users:\n")
        for user in users:
            print(f"   Email: {user.get('email')}")
            print(f"   Name: {user.get('full_name')}")
            print(f"   Role: {user.get('role')}")
            print(f"   Active: {user.get('is_active')}")
            print()
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
