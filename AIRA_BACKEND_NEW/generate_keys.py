"""Generate secure keys for .env file"""
import secrets

print("=" * 60)
print("🔐 AIRA Backend - Secure Key Generator")
print("=" * 60)
print()

# Generate ELEVENLABS_TOOLS_API_KEY
tools_api_key = secrets.token_urlsafe(32)
print("1. ELEVENLABS_TOOLS_API_KEY (for tool authentication):")
print(f"   {tools_api_key}")
print()

# Generate ELEVENLABS_WEBHOOK_SECRET
webhook_secret = secrets.token_urlsafe(32)
print("2. ELEVENLABS_WEBHOOK_SECRET (for webhook verification):")
print(f"   {webhook_secret}")
print()

# Generate JWT_SECRET_KEY (more secure than current one)
jwt_secret = secrets.token_urlsafe(32)
print("3. JWT_SECRET_KEY (more secure than current):")
print(f"   {jwt_secret}")
print()

print("=" * 60)
print("📝 Instructions:")
print("=" * 60)
print()
print("1. Copy the keys above")
print("2. Update your .env file:")
print()
print(f"   ELEVENLABS_TOOLS_API_KEY={tools_api_key}")
print(f"   ELEVENLABS_WEBHOOK_SECRET={webhook_secret}")
print(f"   JWT_SECRET_KEY={jwt_secret}")
print()
print("3. Save the .env file")
print("4. Restart the backend: python run.py")
print()
print("⚠️  IMPORTANT:")
print("   - Keep these keys secret!")
print("   - Don't commit .env to git")
print("   - Use these same keys in ElevenLabs portal")
print()
print("=" * 60)
