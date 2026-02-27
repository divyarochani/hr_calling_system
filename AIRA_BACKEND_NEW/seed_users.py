"""Seed initial users in MongoDB"""
import asyncio
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_users():
    """Seed initial users"""
    print("🌱 Seeding users...")
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_uri)
    await init_beanie(
        database=client[settings.mongodb_database],
        document_models=[User]
    )
    
    # Check if admin user exists
    admin_user = await User.find_one(User.email == "admin@example.com")
    if admin_user:
        print(f"⚠️  Admin user already exists")
        print("   Skipping seed...")
        print("\n📝 Login credentials:")
        print("   Admin: admin@example.com / admin123")
        return
    
    # Create users
    users_data = [
        {
            "name": "Admin User",
            "email": "admin@example.com",
            "password": "admin123",
            "role": "admin"
        },
        {
            "name": "HR Manager",
            "email": "hr@example.com",
            "password": "hr123",
            "role": "hr_manager"
        },
        {
            "name": "Recruiter",
            "email": "recruiter@example.com",
            "password": "recruiter123",
            "role": "recruiter"
        }
    ]
    
    for user_data in users_data:
        user = User(
            name=user_data["name"],
            email=user_data["email"],
            password_hash=pwd_context.hash(user_data["password"]),
            role=user_data["role"],
            is_active=True
        )
        await user.insert()
        print(f"✅ Created user: {user.email} (password: {user_data['password']})")
    
    print(f"\n✅ Seeded {len(users_data)} users successfully!")
    print("\n📝 Login credentials:")
    print("   Admin: admin@example.com / admin123")
    print("   HR Manager: hr@example.com / hr123")
    print("   Recruiter: recruiter@example.com / recruiter123")


if __name__ == "__main__":
    asyncio.run(seed_users())
