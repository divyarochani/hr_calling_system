import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api.config';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Connect to FastAPI Socket.IO server
        console.log('🔌 Connecting to Socket.IO server at:', API_BASE_URL);
        
        const socketInstance = io(API_BASE_URL, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            timeout: 20000,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket.IO connected successfully');
            console.log('📡 Socket ID:', socketInstance.id);
            setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket.IO disconnected:', reason);
            setConnected(false);
        });

        socketInstance.on('connection_established', (data) => {
            console.log('✅ Connection established:', data);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket.IO connection error:', error.message);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
        });

        socketInstance.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Socket.IO reconnection attempt', attemptNumber);
        });

        // Listen for all events for debugging
        socketInstance.onAny((eventName, ...args) => {
            console.log(`📡 Socket.IO event: ${eventName}`, args);
        });

        setSocket(socketInstance);

        return () => {
            console.log('🔌 Disconnecting Socket.IO...');
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
