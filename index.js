import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import './db.js'; // Database connection
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

app.use(cors({
    origin: ['http://localhost:5173'],  // Allow both localhost and production URLs
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],  // Authorization header for tokens
}));

// Routes
app.use('/auth', AdminRouter);
app.use('/student', studentRouter);
app.use('/book', bookRouter);

// Dashboard Route with Token-Based Authentication via Headers
app.get('/dashboard', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).json({ message: "No token provided" });
        }

        // Token verification for both admin and student roles can be done here if needed
        // jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        //     if (err) return res.status(403).json({ message: "Invalid token" });
        //     req.user = user;
        // });

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
