import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const Connection = async () => {
    try{
    mongoose.connect(process.env.URL)
    console.log("Connected")
    }
    catch(error) {
       console.log("Error", +error)
    }

}
Connection()