import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }, 
    description : {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images:[{
        type: String,
        required: true
    }],
    category: {
        type: String,
        required: true
    }, 
    brand: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 0
    }
})


export const Product = mongoose.model("Product", productSchema)