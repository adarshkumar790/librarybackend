import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
   try {
      const { username, password, role } = req.body;

      if (role === 'admin') {
         const admin = await Admin.findOne({ username });
         if (!admin) {
            return res.status(400).json({ message: "Admin not registered" });
         }

         const validPassword = await bcrypt.compare(password, admin.password);
         if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
         }

         const token = jwt.sign({ username: admin.username, role: 'admin' }, process.env.Admin_Key, { expiresIn: '1h' });
         return res.status(200).json({ login: true, role: 'admin', token });
      } else if (role === 'student') {
         const student = await Student.findOne({ username });
         if (!student) {
            return res.status(400).json({ message: "Student not registered" });
         }

         const validPassword = await bcrypt.compare(password, student.password);
         if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
         }

         const token = jwt.sign({ username: student.username, role: 'student' }, process.env.Student_Key, { expiresIn: '1h' });
         return res.status(200).json({ login: true, role: 'student', token });
      } else {
         return res.status(400).json({ message: "Invalid role" });
      }
   } catch (err) {
      return res.status(500).json({ error: err.message });
   }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (!token) {
      return res.status(403).json({ message: "No token provided" });
   }

   jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
      if (err) {
         return res.status(403).json({ message: "Invalid token" });
      }

      req.username = decoded.username;
      req.role = decoded.role;
      if (req.role !== 'admin') {
         return res.status(403).json({ message: "Unauthorized access" });
      }
      next();
   });
};

// Middleware to verify any user (admin or student) token
const verifyUser = (req, res, next) => {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (!token) {
      return res.status(403).json({ message: "No token provided" });
   }

   jwt.verify(token, process.env.Admin_Key, (err, decodedAdmin) => {
      if (err) {
         // Try verifying as student if admin token fails
         jwt.verify(token, process.env.Student_Key, (err, decodedStudent) => {
            if (err) {
               return res.status(403).json({ message: "Invalid token" });
            }
            req.username = decodedStudent.username;
            req.role = decodedStudent.role;
            next();
         });
      } else {
         req.username = decodedAdmin.username;
         req.role = decodedAdmin.role;
         next();
      }
   });
};

// Verify route for checking user role
router.get('/verify', verifyUser, (req, res) => {
   return res.status(200).json({ login: true, role: req.role });
});

// Logout route (In JWT-based systems, logout is usually handled on the client-side by deleting the token)
router.get('/logout', (req, res) => {
   return res.status(200).json({ logout: true });
});

export { router as AdminRouter, verifyAdmin };
