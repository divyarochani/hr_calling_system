"""FastAPI application entry point"""
from contextlib import asynccontextmanager
from datetime import datetime
import socketio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import lifespan_db
from app.api import auth, users, calls, candidates, tools, webhooks
from app.services.socketio_service import sio


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    """Application lifespan handler"""
    async with lifespan_db():
        yield


# Create FastAPI app
fastapi_app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered HR Calling Agent System - Unified Backend",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS middleware
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
fastapi_app.include_router(auth.router)
fastapi_app.include_router(users.router)
fastapi_app.include_router(calls.router)
fastapi_app.include_router(candidates.router)
fastapi_app.include_router(tools.router)
fastapi_app.include_router(webhooks.router)


@fastapi_app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "message": "AIRA Unified Backend is running",
        "socketio": "enabled"
    }


@fastapi_app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": settings.app_version,
        "socketio": "enabled"
    }


@fastapi_app.get("/test-socketio", tags=["Testing"])
async def test_socketio():
    """Test Socket.IO by emitting a test event"""
    test_data = {
        "message": "Test event from backend",
        "timestamp": datetime.utcnow().isoformat(),
        "test": True
    }
    
    try:
        # Get number of connected clients
        rooms = sio.manager.rooms
        clients_count = len(sio.manager.get_participants('/', '/'))
        
        await sio.emit('test:event', test_data)
        return {
            "success": True,
            "message": "Test event emitted",
            "data": test_data,
            "connected_clients": clients_count,
            "socketio_active": True
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to emit event: {str(e)}",
            "socketio_active": False
        }


@fastapi_app.post("/test-call-event", tags=["Testing"])
async def test_call_event():
    """Manually trigger a call status event for testing"""
    from app.services.socketio_service import emit_call_status
    
    test_call_data = {
        'id': 'test_id_123',
        'call_sid': 'test_call_sid_456',
        'phone_number': '+919999999999',
        'candidate_id': None,
        'status': 'ringing',
        'call_type': 'outbound',
        'start_time': datetime.utcnow().isoformat(),
        'duration': None
    }
    
    try:
        await emit_call_status(test_call_data)
        return {
            "success": True,
            "message": "Test call:status event emitted",
            "data": test_call_data
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to emit event: {str(e)}"
        }


# Create the combined Socket.IO + FastAPI app
# This wraps FastAPI with Socket.IO
app = socketio.ASGIApp(
    socketio_server=sio,
    other_asgi_app=fastapi_app,
    socketio_path='socket.io'
)


if __name__ == "__main__":
    import uvicorn
    # Run the combined Socket.IO + FastAPI app
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, log_level="info", reload=True)
