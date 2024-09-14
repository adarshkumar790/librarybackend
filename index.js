import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './db.js'; // Ensure db.js is correctly connecting to your database
import { AdminRouter } from './routes/auth.js'; // Correct typo from 'AdminRuter'
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
    origin: 'https://libraryfrontend.vercel.app', // Allow your frontend URL
    credentials: true, // Enable cookies if required
    methods: ['GET', 'POST', 'PUT', 'DELETE'] // Define allowed methods
}));

app.use(cookieParser());

// Routes
app.use('/auth', AdminRouter); // Fixed route name
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
