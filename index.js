import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db.js';
import { AdminRuter } from './routes/auth.js';
import { studentRouter } from './routes/student.js';
import { bookRouter } from './routes/book.js';
import { Book } from './models/Book.js';
import { Student } from './models/Student.js';
import { Admin } from './models/Admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*',  // Allows all origins in production, can be restricted for specific domains
    credentials: true
}));

app.use(cookieParser());

// Routes
app.use('/auth', AdminRuter);
app.use('/student', studentRouter);
app.use('/book', bookRouter);

// Dashboard Route
app.get('/dashboard', async (req, res) => {
    try {
        const student = await Student.countDocuments();
        const book = await Book.countDocuments();
        const admin = await Admin.countDocuments();
        return res.json({ ok: true, student, book, admin });
    } catch (error) {
        return res.status(500).json({ error: 'Server Error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
