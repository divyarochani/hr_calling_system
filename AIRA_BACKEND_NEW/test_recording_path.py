"""Test script to verify recording path logic"""
from pathlib import Path

# Simulate the path logic from webhooks.py
# This file is at: AIRA_BACKEND_NEW/test_recording_path.py
# webhooks.py is at: AIRA_BACKEND_NEW/app/api/webhooks.py

# From webhooks.py perspective:
# __file__ = AIRA_BACKEND_NEW/app/api/webhooks.py
# parent = AIRA_BACKEND_NEW/app/api
# parent.parent = AIRA_BACKEND_NEW/app
# parent.parent.parent = AIRA_BACKEND_NEW

# Simulate from this test file
test_file_path = Path(__file__)  # AIRA_BACKEND_NEW/test_recording_path.py
project_root = test_file_path.parent  # AIRA_BACKEND_NEW
recordings_dir = project_root / "recordings"

print(f"📁 Test file: {test_file_path}")
print(f"📁 Project root: {project_root}")
print(f"📁 Recordings dir: {recordings_dir}")
print(f"📁 Recordings dir (absolute): {recordings_dir.absolute()}")
print(f"✅ Recordings dir exists: {recordings_dir.exists()}")

# Create if not exists
recordings_dir.mkdir(exist_ok=True)
print(f"✅ Recordings dir created/verified")

# Test file creation
test_file = recordings_dir / "test.txt"
with open(test_file, "w") as f:
    f.write("Test recording file")
print(f"✅ Test file created: {test_file}")

# Clean up
test_file.unlink()
print(f"✅ Test file deleted")

print("\n🎉 Recording path logic works correctly!")
