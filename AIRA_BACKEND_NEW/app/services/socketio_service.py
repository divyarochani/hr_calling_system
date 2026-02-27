"""Socket.IO service for real-time updates"""
import socketio
from app.utils.logging import get_logger

logger = get_logger("services.socketio")

# Create Socket.IO server with CORS enabled
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',  # Allow all origins for development
    logger=False,  # Disable verbose Socket.IO logging
    engineio_logger=False  # Disable verbose Engine.IO logging (PING/PONG)
)


@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    logger.info(f"socketio_client_connected sid={sid}")
    await sio.emit('connection_established', {'sid': sid}, room=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"socketio_client_disconnected sid={sid}")


# Utility functions to emit events
async def emit_call_status(call_data: dict):
    """Emit call status update to all connected clients"""
    logger.info(f"socketio_emit_call_status call_id={call_data.get('id')}")
    await sio.emit('call:status', call_data)


async def emit_call_completed(call_data: dict):
    """Emit call completed event to all connected clients"""
    logger.info(f"socketio_emit_call_completed call_id={call_data.get('id')}")
    await sio.emit('call:completed', call_data)


async def emit_candidate_updated(candidate_data: dict):
    """Emit candidate updated event to all connected clients"""
    logger.info(f"socketio_emit_candidate_updated candidate_id={candidate_data.get('id')}")
    await sio.emit('candidate:updated', candidate_data)


async def emit_notification(notification_data: dict):
    """Emit new notification to all connected clients"""
    logger.info(f"socketio_emit_notification type={notification_data.get('type')}")
    await sio.emit('notification:new', notification_data)
