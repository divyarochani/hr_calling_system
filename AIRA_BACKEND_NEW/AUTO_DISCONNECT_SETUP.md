# Auto Call Disconnection Setup

## Problem
Calls are not disconnecting automatically when the AI agent says closing phrases like:
- "Okay thank you for your time, great day ahead, I will call you tomorrow"
- "Your screening interview is now completed"
- "Have a great day ahead"

## Solution

There are TWO ways to implement auto-disconnect with ElevenLabs:

### Method 1: Use end_call Tool (RECOMMENDED)

Add the `end_call` tool to your ElevenLabs agent configuration.

#### Step 1: Add Tool to ElevenLabs Agent

In your ElevenLabs agent settings, add this tool:

**Tool Name**: `end_call`

**Tool URL**: `https://your-ngrok-url.ngrok-free.dev/calls/tools/end_call`

**Tool Description**:
```
End the current call when the conversation is complete. Call this tool when you have finished the screening interview and said your closing statement.
```

**Tool Parameters**:
```json
{
  "type": "object",
  "properties": {
    "phone_number": {
      "type": "string",
      "description": "The candidate's phone number"
    },
    "reason": {
      "type": "string",
      "description": "Reason for ending the call",
      "default": "Call completed"
    }
  },
  "required": ["phone_number"]
}
```

#### Step 2: Update Agent Prompt

Add this to your ElevenLabs agent prompt:

```
IMPORTANT - ENDING THE CALL:
When you have completed the screening interview and said your closing statement, you MUST call the end_call tool to disconnect the call.

Your closing statement should be:
"Thank you for your time. Your screening interview is now completed. Our team will review your profile, and if shortlisted, we will contact you for the next round. Have a great day ahead."

After saying this closing statement, immediately call the end_call tool with the candidate's phone number.

Example:
1. Say: "Thank you for your time. Your screening interview is now completed..."
2. Call: end_call(phone_number="+919694796480", reason="Screening completed")
```

### Method 2: Configure in ElevenLabs Agent Settings

ElevenLabs agents can be configured to automatically end calls based on conversation completion.

#### In ElevenLabs Dashboard:

1. Go to your agent settings
2. Find "Conversation End Detection" or "Auto Disconnect" settings
3. Enable automatic call ending
4. Set the trigger phrases:
   - "screening interview is now completed"
   - "have a great day ahead"
   - "call you tomorrow"
   - "thank you for your time"

## Testing

### Test 1: Check if end_call tool is working

```bash
curl -X POST "http://localhost:8001/calls/tools/end_call" \
  -H "x-api-key: YOUR_TOOLS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+919694796480",
    "reason": "Test disconnect"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Call will be ended",
  "action": "end_call"
}
```

### Test 2: Check completion detection

```bash
curl -X POST "http://localhost:8001/webhooks/test_completion_detection" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_message": "Thank you for your time, great day ahead, I will call you tomorrow"
  }'
```

Expected response:
```json
{
  "agent_message": "Thank you for your time, great day ahead, I will call you tomorrow",
  "should_disconnect": true,
  "message": "Completion detected"
}
```

### Test 3: Make a real call

1. Start backend: `python run.py`
2. Make a test call
3. Complete the interview
4. AI should say closing statement
5. AI should call end_call tool
6. Call should disconnect
7. Check backend logs for: `🔚 tool_end_call`

## Troubleshooting

### Issue: Call not disconnecting

**Check 1**: Is the end_call tool configured in ElevenLabs?
- Go to ElevenLabs dashboard
- Check agent tools
- Verify end_call tool is added with correct URL

**Check 2**: Is the agent calling the tool?
- Check backend logs for `🔚 tool_end_call`
- If not present, agent is not calling the tool
- Update agent prompt to be more explicit about calling end_call

**Check 3**: Is the tool URL correct?
- Tool URL should be: `https://your-ngrok-url/calls/tools/end_call`
- Test the URL manually with curl
- Check ngrok is running and forwarding to port 8001

**Check 4**: Is the API key correct?
- Tool should send header: `x-api-key: YOUR_TOOLS_API_KEY`
- Check .env file: `ELEVENLABS_TOOLS_API_KEY=...`
- Verify key matches in ElevenLabs tool configuration

### Issue: Tool returns error

**Check backend logs**:
```bash
# Look for errors
grep "tool_end_call" backend.log
grep "ERROR" backend.log
```

**Common errors**:
- 401: API key mismatch
- 500: Database connection issue
- 404: Tool URL incorrect

## Backend Logging

When auto-disconnect works, you'll see:

```
🔚 tool_end_call phone=+919694796480 reason=Screening completed
✅ Call marked as completed: 507f1f77bcf86cd799439011
✅ tool_end_call_success
```

## Files Modified

1. `app/api/tools.py` - Added end_call tool
2. `app/api/webhooks.py` - Added test_completion_detection endpoint
3. `app/utils/completion_detection.py` - Enhanced phrase detection
4. `AUTO_DISCONNECT_SETUP.md` - This documentation

## Next Steps

1. Add end_call tool to ElevenLabs agent
2. Update agent prompt with end_call instructions
3. Test with a real call
4. Monitor backend logs
5. Verify call disconnects automatically

## Alternative: Webhook-based Disconnect

If ElevenLabs doesn't support the end_call tool, you can use webhooks:

1. ElevenLabs sends post_call_transcription webhook
2. Backend detects completion phrases
3. Backend calls ElevenLabs API to end call (if API supports it)

Note: This requires ElevenLabs to provide a "terminate call" API endpoint.
