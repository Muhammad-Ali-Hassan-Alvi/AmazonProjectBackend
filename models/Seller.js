import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shopName: {
        type: String,
        required: true,
    },
    products: [{
        productIs: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    }],
    earnings: {
        type: Number,
        default: 0
    }
})


export default mongoose.model("Seller", sellerSchema)