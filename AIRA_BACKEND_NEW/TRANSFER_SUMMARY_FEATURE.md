# Transfer Summary Briefing Feature

## Overview

When a call is transferred to a human agent, the system automatically briefs the human agent with candidate details before connecting them to the candidate. This helps the human agent understand the context and provide better service.

## How It Works

### 1. AI Agent Requests Transfer

When the AI agent needs to transfer a call, it calls the `request_human_transfer` tool:

```json
{
  "phone_number": "+919694796480",
  "reason": "Candidate wants to discuss salary negotiation",
  "candidate_name": "Rahul Sharma",
  "urgency": "high"
}
```

### 2. System Builds Summary

The system automatically:
1. Finds the candidate in the database
2. Extracts candidate details (name, domain, experience, CTC, notice period, etc.)
3. Builds a concise summary for the human agent
4. Stores the summary temporarily

### 3. Human Agent Answers

When the human agent answers the transferred call, they hear:

> "Incoming transfer from AIRA HR assistant. Transfer reason: Candidate wants to discuss salary negotiation. Candidate details: Candidate name is Rahul Sharma, Domain is Python, Experience is 5 years, Current CTC is 12 LPA, Expected CTC is 18 LPA, Notice period is 30 days, Location is Bangalore."

### 4. Call Connects

After the briefing, the human agent is connected to the candidate.

## API Endpoints

### 1. Request Transfer Tool

**Endpoint**: `POST /calls/tools/request_human_transfer`

**Headers**:
```
x-api-key: <ELEVENLABS_TOOLS_API_KEY>
```

**Request Body**:
```json
{
  "phone_number": "+919694796480",
  "reason": "Candidate wants to discuss salary",
  "candidate_name": "Rahul Sharma",
  "urgency": "high",
  "call_sid": "convai_abc123"
}
```

**Response**:
```json
{
  "transfer": "+917733078170"
}
```

### 2. Whisper Endpoint (Auto-called by ElevenLabs)

**Endpoint**: `GET /calls/tools/whisper?call_sid=convai_abc123`

**Response**: Plain text summary spoken to human agent

### 3. Debug Endpoint

**Endpoint**: `GET /calls/tools/transfer_summaries`

**Headers**:
```
x-api-key: <ELEVENLABS_TOOLS_API_KEY>
```

**Response**:
```json
{
  "count": 2,
  "summaries": {
    "convai_abc123": "Incoming transfer from AIRA...",
    "+919694796480": "Incoming transfer from AIRA..."
  }
}
```

## Data Extraction

The system extracts candidate information from three sources (in order of priority):

### 1. Candidate Database
If the candidate exists in the database, their profile is used.

### 2. Call Transcript
If no candidate record exists, the system extracts information from the conversation transcript using keyword matching:
- Name: "my name is", "I am"
- Domain: Python, Java, React, etc.
- Experience: "X years of experience"
- CTC: "X lakh", "X LPA"
- Notice Period: "X days notice", "immediate joiner"

### 3. Payload Data
If neither database nor transcript has data, basic info from the transfer request is used.

## Configuration

### Environment Variables

```env
# Human Agent Transfer
HUMAN_AGENT_NUMBER=+917733078170
```

### ElevenLabs Agent Configuration

In your ElevenLabs agent prompt, include the transfer tool:

```
When the candidate requests to speak with a human or you need human assistance, use the request_human_transfer tool with:
- phone_number: The candidate's phone number
- reason: Why the transfer is needed
- candidate_name: The candidate's name if known
- urgency: "high", "medium", or "low"
```

## Testing

### Test Transfer Summary Generation

```bash
cd AIRA_BACKEND_NEW
python test_transfer_summary.py
```

### Test Transfer Flow

1. Start the backend server
2. Make a test call
3. During the call, ask to speak with a human
4. The AI will call the transfer tool
5. Check backend logs for:
   - `🔄 tool_request_human_transfer`
   - `💾 Stored transfer summary`
   - `📝 Summary: ...`
6. When human agent answers, they'll hear the briefing

## Example Summaries

### Full Details
> "Incoming transfer from AIRA HR assistant. Transfer reason: Candidate wants to discuss salary negotiation. Candidate details: Candidate name is Rahul Sharma, Domain is Python, Experience is 5 years, Current CTC is 12 LPA, Expected CTC is 18 LPA, Notice period is 30 days, Location is Bangalore."

### Minimal Details
> "Incoming transfer from AIRA HR assistant. Transfer reason: Technical query. Candidate details: Candidate name is John Doe."

### No Details
> "Incoming transfer from AIRA HR assistant. Candidate details not available."

## Files Modified/Created

1. `app/utils/data_extraction.py` - Data extraction and summary building
2. `app/api/tools.py` - Transfer tool and whisper endpoint
3. `test_transfer_summary.py` - Test script
4. `TRANSFER_SUMMARY_FEATURE.md` - This documentation

## Benefits

1. **Context for Human Agent**: Human knows who they're talking to before the call connects
2. **Better Service**: Human can prepare and provide personalized assistance
3. **Time Saving**: No need to ask candidate to repeat information
4. **Professional Experience**: Smooth handoff from AI to human
5. **Improved Conversion**: Better candidate experience leads to higher acceptance rates

## Future Enhancements

1. **Azure OpenAI Integration**: Use GPT-4 for more accurate data extraction (see old code)
2. **Redis Storage**: Replace in-memory dict with Redis for production scalability
3. **Custom Briefing Templates**: Allow customization of summary format per use case
4. **Multi-language Support**: Generate summaries in different languages
5. **Voice Cloning**: Use specific voice for briefing vs. candidate conversation
