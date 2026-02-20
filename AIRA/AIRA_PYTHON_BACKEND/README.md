# AI Calling Agent - Twilio + ElevenLabs

Real-time AI voice calling agent using Twilio Media Streams and ElevenLabs Conversational AI.

**Version**: 2.0.0  
**Backend API** for frontend integration with CORS support

## Features

- ✅ Bidirectional real-time audio streaming (μ-law 8000 Hz)
- ✅ Natural AI conversations over phone calls
- ✅ REST API for outbound calling
- ✅ Real-time transcription display
- ✅ Automatic call recording (mixed audio - both voices)
- ✅ Conversation transcripts (JSON format)
- ✅ Structured data extraction using OpenAI GPT-4o-mini
- ✅ Human agent transfer (keyword-based detection)
- ✅ CORS-enabled for frontend integration
- ✅ Production-ready error handling

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number (E.164 format)
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `ELEVENLABS_AGENT_ID` - Your ElevenLabs Agent ID
- `SERVER_URL` - Your public server URL (e.g., ngrok URL)

Optional variables:
- `HUMAN_AGENT_NUMBER` - Phone number for human agent transfers
- `OPENAI_API_KEY` - OpenAI API key for structured data extraction

### 3. Configure ElevenLabs Agent

In your ElevenLabs agent settings:
- **TTS Output Format**: Select "μ-law 8000 Hz" (Telephony)
- **User Input Audio Format**: Select "μ-law 8000 Hz" (Telephony)

### 4. Setup ngrok (for local development)

```bash
ngrok http 8000
```

Copy the HTTPS URL to your `.env` file as `SERVER_URL`.

### 5. Run the Server

```bash
python run.py
```

Or directly:
```bash
python -m src.main
```

Server starts on `http://0.0.0.0:8000`

## Project Structure

```
src/
├── main.py                  # FastAPI application entry point
├── config/                  # Configuration management
│   └── settings.py          # Environment variables & settings
├── services/                # Business logic services
│   ├── audio_processing.py  # Audio recording & mixing
│   ├── data_extraction.py   # OpenAI data extraction
│   └── twilio_service.py    # Twilio operations
└── utils/                   # Utility functions
    ├── file_storage.py      # File save operations
    └── transfer_detection.py # Transfer keyword detection
```

## API Endpoints

### `GET /health`
Health check endpoint

### `POST /call/outbound`
Initiate outbound call (for frontend integration)

**Request:**
```json
{
  "phone_number": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "call_sid": "CAxxxx",
  "phone_number": "+1234567890"
}
```

### `POST /voice`
Twilio voice webhook (returns TwiML)

### `WebSocket /media`
WebSocket endpoint for Twilio Media Streams

### `POST /transfer`
Call transfer endpoint for human agent

## Usage

### Making Outbound Calls via API

```bash
curl -X POST http://localhost:8000/call/outbound \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1234567890"}'
```

### Receiving Inbound Calls

Configure your Twilio phone number webhook to:
```
https://your-server-url.com/voice
```

### Human Agent Transfer

When a caller says keywords like "human", "agent", "transfer", etc., the call automatically transfers to the configured `HUMAN_AGENT_NUMBER`.

**Transfer keywords:**
- "human", "agent", "person", "representative", "operator"
- "transfer", "speak to someone", "talk to someone"
- "real person", "live agent", "customer service"

## How It Works

1. **Call Initiation**: Frontend calls `/call/outbound` OR Twilio receives inbound call
2. **TwiML Response**: Server returns TwiML with Media Stream connection
3. **WebSocket Bridge**: FastAPI bridges Twilio ↔ ElevenLabs WebSocket connections
4. **Real-time Streaming**: Bidirectional audio flows in real-time (μ-law 8000 Hz)
5. **Recording**: Both audio tracks captured and mixed
6. **Data Extraction**: OpenAI extracts structured candidate data after call

## Audio Format

- **Twilio**: μ-law (ulaw) 8000 Hz, base64 encoded
- **ElevenLabs**: μ-law 8000 Hz (input and output)
- **Saved Recordings**: 16-bit PCM WAV, 8000 Hz, Mono (mixed)
- **Codec**: G.711 μ-law for telephony quality

## Structured Data Extraction

After each call, the system automatically extracts structured candidate data using OpenAI GPT-4o-mini:

```json
{
  "candidate_name": "John Doe",
  "current_company": "Tech Corp",
  "current_role": "Software Engineer",
  "desired_role": "Senior Developer",
  "experience_years": "5",
  "current_ctc_lpa": "12",
  "expected_ctc_lpa": "18",
  "communication_score": "8",
  "technical_score": "7",
  "overall_score": "7.5",
  ...
}
```

**Cost**: ~$0.01-0.02 per call  
**Optional**: Works without OpenAI API key (returns null values)

## Troubleshooting

### No audio from agent
- Check ElevenLabs TTS output format is set to "μ-law 8000 Hz"
- Verify `SERVER_URL` is correct and accessible

### Agent can't hear you
- Check ElevenLabs user input format is set to "μ-law 8000 Hz"
- Verify Twilio Media Stream is connected (check logs)

### Connection issues
- Ensure ngrok is running and URL is up to date
- Check firewall settings allow WebSocket connections
- Verify all API keys are correct

## Files Generated

After each call, three files are saved in `recordings/`:

1. `{phone}_{timestamp}.wav` - Mixed audio recording (both voices)
2. `{phone}_{timestamp}_transcript.json` - Full conversation transcript
3. `{phone}_{timestamp}_userData.json` - Extracted structured data

## Documentation

See **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** for complete documentation including:
- Detailed project structure
- Workflow diagrams
- Feature deep dives
- Configuration details
- Troubleshooting guide
- Production deployment checklist
- Cost estimates

## Production Deployment

For production use:

1. Deploy to a cloud service (AWS, GCP, Azure, Heroku, etc.)
2. Use a proper domain with SSL certificate
3. Configure CORS for specific frontend domains
4. Set up monitoring and logging
5. Implement rate limiting
6. Add authentication for webhooks
7. Store recordings in cloud storage (S3, GCS)

## License

MIT
