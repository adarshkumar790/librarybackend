import express from "express";
import bcrypt from 'bcrypt';
import { Admin } from "./models/Admin.js";
import './db.js'

 async function AdminAccount() {
try {
    const adminCount = await Admin.countDocuments()
    if(adminCount === 0) {
        const hashPassword = await bcrypt.hash('adminpassword', 10)
        const newAdmin = new Admin({
            username: 'admin',
            password:hashPassword
        })
        await newAdmin.save()
        console.log('account creaetd')
    } else {
        console.log('account aleady existed')
    }
} catch (error) {
     console.log("error")
}
}

AdminAccount()