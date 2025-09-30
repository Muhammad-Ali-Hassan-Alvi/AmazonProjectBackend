import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name must be unique"],
      unique: true,
      trim: true,
      min: [2, "Minimum 2 Characters required for the Category"],
      max: [30, "maximum 30 characters can be added in the category"],
    },
    slug: {
      type: String,
      unique: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 3,
      max: 15,
      default: 5,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // For V2: to create sub-categories like Electronics -> Laptops
    // parent: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Category",
    //   default: null,
    // },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { limit: true, strict: true });
  }
  next();
});

export default mongoose.model("Category", categorySchema);
