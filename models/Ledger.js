import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    taxes: { type: Number, required: true, default: 0 },
    discounts: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    totalPlatformFee: { type: Number, required: true, default: 0 },
    totalSellerEarnings: { type: Number, required: true, default: 0 },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "partially-refunded"],
      default: "pending",
    },
    currency: { type: String, required: true, default: "USD" },
  },
  { timestamps: true }
);

ledgerSchema.index({ orderId: 1 });

export default mongoose.model("Ledger", ledgerSchema);


