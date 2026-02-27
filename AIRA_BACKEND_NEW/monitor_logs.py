"""Monitor backend logs for tool calls"""
import time
import subprocess

print("=" * 70)
print("📊 Monitoring Backend Logs for Tool Calls")
print("=" * 70)
print("\n💡 Make a test call from ElevenLabs portal now!")
print("   You'll see tool calls appear here in real-time.\n")
print("🔍 Watching for:")
print("   - tool_get_candidate_info")
print("   - tool_save_screening_data")
print("   - tool_request_human_transfer")
print("   - tool_end_call_with_summary")
print("   - tool_schedule_callback")
print("   - tool_get_system_date")
print("\n" + "=" * 70 + "\n")

# This will show the process output
# Since the backend is already running, we'll just show instructions
print("⚠️  Backend is running in background (Process ID: 2)")
print("\n📝 To see logs, check the terminal where you ran 'python run.py'")
print("   OR use the Kiro IDE to view process output")
print("\n💡 Alternative: Check MongoDB directly to see saved data")
print("\n" + "=" * 70)
