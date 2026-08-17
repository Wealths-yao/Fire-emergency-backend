// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const socketService = require('./services/socketService');
const globalErrorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

// 3. INITIALIZE REAL-TIME WEBSOCKET SERVICES
socketService.init(server);

// --- GLOBAL SECURITY MIDDLEWARES ---
app.use(helmet());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Payload Input Body Filter: Protection against hidden NoSQL Injection keys
app.use((req, res, next) => {
    if (req.body) {
        const cleanData = (obj) => {
            for (let key in obj) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    cleanData(obj[key]);
                }
            }
        };
        cleanData(req.body);
    }
    next();
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);
app.use(express.json({ limit: '10kb' }));

// --- SYSTEM API PATHWAYS ---
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);

// Catch-All Endpoint Not Found Router Handler Gate
app.use((req, res, next) => {
    res.status(404);
    const error = new Error(`Resource Path Location Request Not Found - [${req.originalUrl}]`);
    next(error);
});

// Central Exception Error boundary
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(` SERVER LIVE: RUNNING IN MODE [${process.env.NODE_ENV || 'development'}] ON PORT: ${PORT} `);
});
