"""Test Socket.IO connection and events"""
import asyncio
import socketio

async def test_socketio():
    """Test Socket.IO connection to backend"""
    sio = socketio.AsyncClient()
    
    @sio.event
    async def connect():
        print("✅ Connected to Socket.IO server")
        print(f"Socket ID: {sio.sid}")
    
    @sio.event
    async def disconnect():
        print("❌ Disconnected from Socket.IO server")
    
    @sio.event
    async def connection_established(data):
        print(f"✅ Connection established: {data}")
    
    @sio.on('call:status')
    async def on_call_status(data):
        print(f"📞 Call status update: {data}")
    
    @sio.on('call:completed')
    async def on_call_completed(data):
        print(f"✅ Call completed: {data}")
    
    @sio.on('candidate:updated')
    async def on_candidate_updated(data):
        print(f"👤 Candidate updated: {data}")
    
    @sio.on('notification:new')
    async def on_notification(data):
        print(f"🔔 New notification: {data}")
    
    try:
        # Connect to server
        print("Connecting to http://localhost:8001...")
        await sio.connect('http://localhost:8001', transports=['websocket', 'polling'])
        
        # Wait for events
        print("Listening for events... (Press Ctrl+C to stop)")
        await sio.wait()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await sio.disconnect()

if __name__ == "__main__":
    asyncio.run(test_socketio())
