# AIRA Unified Backend (FastAPI)

This is the new unified backend that replaces both Node.js and Python backends.

## Setup

### 1. Create virtual environment
```bash
cd AIRA_BACKEND_NEW
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Run the server
```bash
# Development
uvicorn app.main:app --reload --port 8001

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 5. Access API docs
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## Project Structure

```
AIRA_BACKEND_NEW/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # Database setup
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── call.py
│   │   ├── candidate.py
│   │   └── notification.py
│   ├── api/                 # API endpoints (to be added)
│   ├── services/            # Business logic (to be added)
│   └── utils/               # Utilities
│       └── auth.py
├── requirements.txt
├── .env.example
└── README.md
```

## Database

- Default: SQLite (aira.db)
- Production: PostgreSQL (configure in .env)

## Migration Status

✅ STEP 2 COMPLETE: Backend structure created
⏳ STEP 3: Database models (done)
⏳ STEP 4: Authentication endpoints
⏳ STEP 5: Call management
⏳ STEP 6: Candidate management
⏳ STEP 7: ElevenLabs integration

## Notes

- Runs on port 8001 (to avoid conflict with old Python backend on 8000)
- All current AIRA functionality will be migrated step by step
- Old backends will remain functional during migration
