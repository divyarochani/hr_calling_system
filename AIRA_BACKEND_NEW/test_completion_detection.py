"""Test script for completion detection"""
from app.utils.completion_detection import should_end_call

# Test cases
test_messages = [
    # Your exact closing statement
    "Thank you for your time. Your screening interview is now completed. Our team will review your profile, and if shortlisted, we will contact you for the next round. Have a great day ahead.",
    
    # Your specific case - MUST DETECT
    "Okay thank you for your time, great day ahead I will call you tomorrow",
    "Thank you for your time, have a great day ahead, I will call you tomorrow",
    "Great day ahead, I will call you back",
    "Thank you, great day ahead",
    "I will call you tomorrow",
    "I'll call you back tomorrow",
    
    # Variations
    "Thank you for your time. The screening interview is completed.",
    "Your interview is now completed. Have a great day ahead.",
    "We will contact you for the next round. Have a great day ahead.",
    "Thank you for your time. Our team will review your profile.",
    
    # Should NOT trigger
    "Thank you for answering that question.",
    "Can you tell me about your experience?",
    "That's great to hear!",
]

print("🧪 Testing Completion Detection\n")
print("=" * 60)

for i, msg in enumerate(test_messages, 1):
    result = should_end_call(msg)
    status = "✅ DETECTED" if result else "❌ NOT DETECTED"
    print(f"\nTest {i}: {status}")
    print(f"Message: {msg[:80]}{'...' if len(msg) > 80 else ''}")
    
print("\n" + "=" * 60)
print("\n✅ Test completed!")
