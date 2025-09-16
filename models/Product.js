import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function (next) {
  if (this.isModified("title") || this.isModified("description")) {
    this.keywords = [
      ...new Set(
        (this.title + " " + this.description)
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 2)
      ),
    ];
  }
  next();
});
export const Product = mongoose.model("Product", productSchema);
