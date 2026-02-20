# AIRA - AI Recruitment Assistant

Complete HR calling system with AI-powered candidate screening and interview scheduling.

## Prerequisites
- Node.js v16+
- Python 3.8+
- MongoDB
- Twilio Account
- Azure OpenAI API

## Installation

```bash
# 1. Install Node.js Backend
cd AIRA_NODE_BACKEND
npm install

# 2. Install Python Backend
cd ../AIRA_PYTHON_BACKEND
pip install -r requirements.txt

# 3. Install Frontend
cd ../AIRA_FRONTEND
npm install
```

## Configuration

Copy `.env.example` to `.env` in each folder and update with your credentials:
- **AIRA_NODE_BACKEND/.env**: MongoDB URI, JWT Secret
- **AIRA_PYTHON_BACKEND/.env**: Twilio credentials, Azure OpenAI API
- **AIRA_FRONTEND/.env**: API URLs

## Running

```bash
# Terminal 1 - Node.js Backend
cd AIRA_NODE_BACKEND && npm start

# Terminal 2 - Python Backend
cd AIRA_PYTHON_BACKEND && python run.py

# Terminal 3 - Frontend
cd AIRA_FRONTEND && npm start
```

Access at: http://localhost:3000

## Deployment

**Production Build:**
```bash
# Frontend
cd AIRA_FRONTEND && npm run build

# Backend (use PM2)
pm2 start AIRA_NODE_BACKEND/server.js --name aira-node
pm2 start AIRA_PYTHON_BACKEND/run.py --name aira-python --interpreter python3
```

**Requirements:**
- MongoDB running
- Nginx/Apache for frontend
- SSL certificate for production
- Public URL for Twilio webhooks

## Features
- AI-powered candidate screening
- Real-time call monitoring
- User management with role-based access
- Call recording and transcription
- Interview scheduling
- Bulk import
- Dark/light theme
- Excel export

## Tech Stack
- React 18 + Redux + Tailwind CSS
- Node.js + Express + MongoDB + Socket.io
- Python + FastAPI + Twilio + Azure OpenAI
