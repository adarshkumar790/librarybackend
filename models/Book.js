import mongoose from "mongoose";

const bookSchema = new mongoose.Schema ({
    cif: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    author: {
        type: String,
        required: true, 
        unique: true
    },
    imageUrl: {
        type: String,
        required: true
    },
})

const bookModel = mongoose.model('Book', bookSchema)
export {bookModel as Book}