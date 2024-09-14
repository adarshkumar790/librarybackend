import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

// Admin and Student Login Route
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

         const token = jwt.sign({ username: student.username, role: 'student' }, process.env.Student_Key, { expiresIn: '1h' });
         return res.json({ login: true, role: 'student', token });
      } else {
         return res.status(400).json({ message: "Invalid role" });
      }

   } catch (err) {
      res.status(500).json({ error: err.message });
   }
});

// Middleware to verify Admin JWT
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token missing or invalid" });
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

// Middleware to verify either Admin or Student JWT
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authorization token missing or invalid" });
    }

    const token = authHeader.split(' ')[1];

    // Verify Admin token first
    jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
        if (err) {
            // If Admin token is invalid, check for Student token
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

// Verify route to test if the JWT is valid
router.get('/verify', verifyUser, (req, res) => {
   return res.json({ login: true, role: req.role });
});

// Logout route (purely for client-side handling, JWT will just expire)
router.get('/logout', (req, res) => {
   return res.json({ logout: true, message: "Logout successful" });
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