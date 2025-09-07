import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    },
  ],
  cart: [
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
  ],
  addresses: [
    {
        street: String,
        city: String,
        state: String,
        houseNo: String,
    }
  ]
});

export default mongoose.model("Buyer", buyerSchema)