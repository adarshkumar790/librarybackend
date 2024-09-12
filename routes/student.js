import express from 'express'
import { Student } from '../models/Student.js';
import bcrypt, { hash } from 'bcrypt';
const router = express.Router();
import { verifyAdmin } from './auth.js';

router.post('/register',verifyAdmin, async (req, res) => {
    try {
         const {roll, username, grade, password} = req.body;
         const student = await Student.findOne({username})
         if(student){
            return res.json({message: "student already registred"})
         }
         const hashPassword = await bcrypt.hash(password, 10)
         const newstudent = new Student({
             username,
             roll: roll,
             grade, 
             password: hashPassword
         })
         await newstudent.save()
         return res.json({registered: true});
    } catch (error) {
         return res.json({message: "Error in registring student"})
    }
})

router.get('/students', async(req, res)=>{
    try {
        const student = await Student.find()
        return res.json(student)
    } catch (err) {
        return res.json(err)    
    }
})

export {router as studentRouter}