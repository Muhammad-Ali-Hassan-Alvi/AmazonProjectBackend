import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    items: [cartItemSchema],
    status: {
      type: String,
      enum: ["active", "abandoned", "ordered"],
      default: "active",
    },
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure only one active cart per user
cartSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

cartSchema.pre("save", function (next) {
  this.total = this.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  next();
});

export default mongoose.model("Cart", cartSchema);
