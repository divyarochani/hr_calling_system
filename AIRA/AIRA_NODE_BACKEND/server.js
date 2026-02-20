const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const callRoutes = require('./routes/callRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const { getScheduler } = require('./services/schedulerService');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve recordings folder as static files
const recordingsPath = path.join(__dirname, '../AIRA_PYTHON_BACKEND/recordings');
app.use('/recordings', express.static(recordingsPath));

// Make io accessible in routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'HR Assistant Backend API',
        version: '2.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile (Protected)',
            },
            calls: {
                updateStatus: 'POST /api/calls/status',
                saveData: 'POST /api/calls/data',
                getAll: 'GET /api/calls',
                getActive: 'GET /api/calls/active',
            },
            candidates: {
                getAll: 'GET /api/candidates',
                getStats: 'GET /api/candidates/stats',
                getById: 'GET /api/candidates/:id',
            },
            notifications: {
                getAll: 'GET /api/notifications',
                getUnread: 'GET /api/notifications/unread',
                markRead: 'PUT /api/notifications/:id/read',
                markAllRead: 'PUT /api/notifications/read-all',
            },
        },
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io server ready`);
    
    // Initialize call scheduler
    getScheduler();
    console.log('Call scheduler initialized');
});
