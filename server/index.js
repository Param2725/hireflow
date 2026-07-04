import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import rateLimit from 'express-rate-limit';

// configuration
dotenv.config();
connectDB();

// app initialization
const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            process.env.CLIENT_URL
        ];

        // Allow requests with no origin (Postman, mobile apps)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5,
    message: { message: 'Too many attempts, please try again later' }
});

const applyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min,
    max: 10,
    message: { message: 'Too many applications, slow down' }
});

import { sendStatusEmail } from './config/mailer.js';

app.get('/test-email', async (req, res) => {
    try {
        await sendStatusEmail(
            process.env.EMAIL_USER,
            'Test User',
            'Software Engineer',
            'HireFlow',
            'Interview'
        );
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.use('api/auth/login', authLimiter);
app.use('api/auth/register', authLimiter);
app.use('api/applications', applyLimiter);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'HireFlow API running'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});