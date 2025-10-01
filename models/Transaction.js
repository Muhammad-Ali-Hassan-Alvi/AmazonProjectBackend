import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: "Ledger", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    orderItemId: { type: mongoose.Schema.Types.ObjectId },

    type: {
      type: String,
      enum: ["sale", "refund", "payout", "adjustment", "platform_fee"],
      required: true,
    },

    amount: { type: Number, required: true },
    description: { type: String },
    sourceTransactionId: { type: String },
  },
  { timestamps: true }
);

transactionSchema.index({ ledgerId: 1, createdAt: -1 });
transactionSchema.index({ storeId: 1, type: 1, createdAt: -1 });

export default mongoose.model("Transaction", transactionSchema);


