"""MongoDB database configuration using Beanie ODM"""
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from contextlib import asynccontextmanager

from app.config import settings
from app.models.user import User
from app.models.call import Call
from app.models.candidate import Candidate
from app.models.notification import Notification
from app.models.elevenlabs_event_log import ElevenLabsEventLog

# Global MongoDB client
mongodb_client: Optional[AsyncIOMotorClient] = None


async def connect_to_mongo():
    """Connect to MongoDB"""
    global mongodb_client
    
    mongodb_client = AsyncIOMotorClient(settings.mongodb_uri)
    
    # Initialize Beanie with document models
    await init_beanie(
        database=mongodb_client[settings.mongodb_database],
        document_models=[
            User,
            Call,
            Candidate,
            Notification,
            ElevenLabsEventLog,
        ]
    )
    
    print(f"✅ Connected to MongoDB: {settings.mongodb_database}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    
    if mongodb_client:
        mongodb_client.close()
        print("❌ Closed MongoDB connection")


@asynccontextmanager
async def lifespan_db():
    """Database lifespan context manager"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


def get_database():
    """Get MongoDB database instance"""
    if mongodb_client is None:
        raise Exception("MongoDB client not initialized")
    return mongodb_client[settings.mongodb_database]
