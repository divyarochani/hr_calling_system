"""Test MongoDB connection and data saving"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def test_mongodb():
    """Test MongoDB connection"""
    print("Testing MongoDB connection...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.aira
    
    try:
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"\n📁 Collections in 'aira' database: {collections}")
        
        # Count documents in each collection
        for collection_name in collections:
            count = await db[collection_name].count_documents({})
            print(f"   - {collection_name}: {count} documents")
        
        # Test insert
        print("\n🧪 Testing insert...")
        test_collection = db.test_collection
        result = await test_collection.insert_one({
            "test": "data",
            "timestamp": datetime.utcnow()
        })
        print(f"✅ Insert successful! ID: {result.inserted_id}")
        
        # Clean up test data
        await test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Cleanup successful!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_mongodb())
