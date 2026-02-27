"""Test script for transfer summary briefing feature"""
from app.utils.data_extraction import build_transfer_summary, extract_candidate_info_from_transcript

# Test 1: Build summary with full candidate data
print("=" * 60)
print("TEST 1: Build Transfer Summary with Full Data")
print("=" * 60)

candidate_data = {
    "candidate_name": "Rahul Sharma",
    "domain": "Python",
    "experience_years": "5",
    "current_ctc_lpa": "12",
    "expected_ctc_lpa": "18",
    "notice_period": "30 days",
    "current_location": "Bangalore",
}

summary = build_transfer_summary(candidate_data, "Candidate wants to discuss salary negotiation")
print(f"\n📝 Summary:\n{summary}\n")

# Test 2: Build summary with minimal data
print("=" * 60)
print("TEST 2: Build Transfer Summary with Minimal Data")
print("=" * 60)

minimal_data = {
    "candidate_name": "John Doe",
    "domain": None,
    "experience_years": None,
    "current_ctc_lpa": None,
    "expected_ctc_lpa": None,
    "notice_period": None,
    "current_location": None,
}

summary = build_transfer_summary(minimal_data, "Technical query")
print(f"\n📝 Summary:\n{summary}\n")

# Test 3: Extract from transcript
print("=" * 60)
print("TEST 3: Extract Candidate Info from Transcript")
print("=" * 60)

sample_transcript = """
Agent: Hello, this is AIRA from Kainskep Solutions. May I know your name?
Candidate: Hi, my name is Priya Patel.
Agent: Great! What is your current role and domain?
Candidate: I am a Python developer with 4 years of experience.
Agent: What is your current CTC?
Candidate: I am currently earning 10 lakh per annum.
Agent: And what is your expected CTC?
Candidate: I am looking for 15 lakh per annum.
Agent: What is your notice period?
Candidate: I have a 60 days notice period.
"""

extracted = extract_candidate_info_from_transcript(sample_transcript)
print(f"\n📋 Extracted Data:")
for key, value in extracted.items():
    if value:
        print(f"  {key}: {value}")

summary = build_transfer_summary(extracted, "Candidate interested in the role")
print(f"\n📝 Generated Summary:\n{summary}\n")

print("=" * 60)
print("✅ All tests completed!")
print("=" * 60)
