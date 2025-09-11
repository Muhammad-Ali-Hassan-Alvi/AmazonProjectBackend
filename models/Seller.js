import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        default: null
        // required: true,
    },
    earnings: {
        type: Number,
        default: 0
    }
})


export default mongoose.model("Seller", sellerSchema)