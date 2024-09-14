import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db.js';
import { AdminRouter } from './routes/auth.js';
import { studentRouter } from './routes/student.js';
import { bookRouter } from './routes/book.js';
import { Book } from './models/Book.js';
import { Student } from './models/Student.js';
import { Admin } from './models/Admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: ['http://localhost:5173', 'https://libraryfrontend.vercel.app'],  // Allow both localhost and production URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Allow credentials (cookies, etc.)
}));

// Routes
app.use('/auth', AdminRouter);
app.use('/student', studentRouter);
app.use('/book', bookRouter);

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    try {
        const studentCount = await Student.countDocuments();
        const bookCount = await Book.countDocuments();
        const adminCount = await Admin.countDocuments();
        return res.json({ ok: true, student: studentCount, book: bookCount, admin: adminCount });
    } catch (error) {
        return res.status(500).json({ error: 'Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
