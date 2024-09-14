import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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
app.use(express.json());  // Parse incoming JSON requests

// CORS configuration - allow any origin (for dev purposes)
app.use(cors({
    origin: '*',  // In production, change '*' to your frontend URL
}));

// Routes
app.use('/auth', AdminRouter);
app.use('/student', studentRouter);
app.use('/book', bookRouter);

// Dashboard Route - Collecting data about the total counts of students, books, and admins
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
