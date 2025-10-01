import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    // Per-item immutable financials (calculated at order creation)
    itemTotal: {
      type: Number,
      default: 0,
    },
    itemPlatformFee: {
      type: Number,
      default: 0,
    },
    itemSellerEarnings: {
      type: Number,
      default: 0,
    },
    itemCommissionRate: {
      // stored as decimal fraction, e.g. 0.13 for 13%
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ["COD", "Stripe"],
        required: true,
        default: "COD",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending",
      },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    platformFee: {
      type: Number,
      default: 0.4
    },
    sellerEarnings: {
      type: Number,
      default: 0
    },
    financialCalculatedAt: {
      type: Date,
    },
    ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger" }
  },
  { timestamps: true }
);

// Helpful indexes for common queries
orderSchema.index({ "items.storeId": 1, status: 1, "payment.status": 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
