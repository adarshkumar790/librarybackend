import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Login route for both Admin and Student
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

         // Sign token for Admin
         const token = jwt.sign({ username: admin.username, role: 'admin' }, process.env.Admin_Key, { expiresIn: '1h' });

         // Return the token in the response (no more setting cookies)
         return res.json({ login: true, role: 'admin', token });

      } else if (role === 'student') {
         const student = await Student.findOne({ username });
         if (!student) {
            return res.status(400).json({ message: "Student not registered" });
         }

         const validPassword = await bcrypt.compare(password, student.password);
         if (!validPassword) {
            return res.status(400).json({ message: "Wrong password" });
         }

         // Sign token for Student
         const token = jwt.sign({ username: student.username, role: 'student' }, process.env.Student_Key, { expiresIn: '1h' });

         // Return the token in the response (no more setting cookies)
         return res.json({ login: true, role: 'student', token });

      } else {
         return res.status(400).json({ message: "Invalid role" });
      }

   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// Middleware to verify Admin
const verifyAdmin = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized access" });
   }

   const token = authHeader.split(' ')[1];
   jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
      if (err) {
         return res.status(403).json({ message: "Invalid token" });
      }
      req.username = decoded.username;
      req.role = decoded.role;
      next();
   });
};

// Middleware to verify Admin or Student token
const verifyUser = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized access" });
   }

   const token = authHeader.split(' ')[1];

   // Try to verify as Admin first
   jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
      if (err) {
         // If not an Admin, try verifying as a Student
         jwt.verify(token, process.env.Student_Key, (err, decoded) => {
            if (err) {
               return res.status(403).json({ message: "Invalid token" });
            }
            req.username = decoded.username;
            req.role = decoded.role;
            next();
         });
      } else {
         req.username = decoded.username;
         req.role = decoded.role;
         next();
      }
   });
};

// Route to verify the token
router.get('/verify', verifyUser, (req, res) => {
   return res.json({ login: true, role: req.role });
});

// Logout route (no more cookie clearing, just client-side token handling)
router.get('/logout', (req, res) => {
   // Client-side will handle token removal (localStorage/sessionStorage)
   return res.json({ logout: true, message: "Logout successful. Please clear the token on the client side." });
});

export { router as AdminRouter, verifyAdmin };



// import express from 'express'
// import { Admin } from '../models/Admin.js';
// import { Student } from '../models/Student.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
// const router = express.Router();

// router.post('/login', async (req, res) => {
//    try {
//     const {username, password, role} = req.body;
//     if(role === 'admin'){
//      const admin = await Admin.findOne({username})
//      if(!admin){
//         return res.json({message: "admin not registred"})
//      }
//      const validPassword = await bcrypt.compare(password, admin.password)
//      if(!validPassword){
//         return res.json({meesage: "wrong password"})        
//      }
//      const token = jwt.sign({username: admin.username, role: 'admin', }, process.env.Admin_Key)
//      res.cookie('token', token, {httpOnly: true, secure: true})
//      return res.json({login:true, role: 'admin'})
//     }
//     else if(role === 'student'){
//       const student = await Student.findOne({username})
//      if(!student){
//         return res.json({message: "student not registred"})
//      }
//      const validPassword = await bcrypt.compare(password, student.password)
//      if(!validPassword){
//         return res.json({meesage: "wrong password"})        
//      }
//      const token = jwt.sign({username: student.username, role: 'student', }, process.env.Student_Key)
//      res.cookie('token', token, {httpOnly: true, secure: true})
//      return res.json({login:true, role: 'student'})
//     }
//     else {

//     }
//    } catch (err){
//       res.json(er);
//    }
// })

// const verifyAdmin = (req, res, next) => {
//     const token = req.cookies.token;
//     if(!token){
//         return res.json({message: "Invalid Admin"})
//     } else {
//       jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
//             if(err){
//                 return res.json({message: "Invalid token"})
//             } else {
//                 req.username = decoded.username;
//                 req.role = decoded.role;
//                 next();
//             }
//         })
//     }
// }



// // const verifyUser = (req, res, next) => {
// //    const token = req.cookies.token;
// //    if(!token){
// //        return res.json({message: "Invalid User"})
// //    } else {
// //      jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
// //            if(err){
// //             jwt.verify(token, process.env.Student_Key, (err, decoded) => {
// //                if(err){
// //                    return res.json({message: "Invalid token"})
// //                } else {
// //                    req.username = decoded.username;
// //                    req.role = decoded.role;
// //                    next();
// //                }
// //            })
// //            } else {
// //                req.username = decoded.username;
// //                req.role = decoded.role;
// //                next();
// //            }
// //        })
// //    }
// // }



// router.get('/verify', verifyUser, (req, res) => {
//    return res.json({login : true, role: req.role})
// })

//  router.get('/logout', (req, res) => {
//    res.clearCookie('token');
//    return res.json({logout : true})
//  })

// export {router as AdminRuter, verifyAdmin};