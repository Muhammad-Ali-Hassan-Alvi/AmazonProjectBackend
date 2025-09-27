import slugify from "slugify";
import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, commisionRate, image } = req.body;

    const categoryExists = Category.findOne({ name });
    if (categoryExists) {
      return res
        .status(400)
        .json({ message: "The same category already exists" });
    }

    const category = new Category({
      name,
      commisionRate,
      image,
    });

    const createdCategory = await category.save();

    return res.status(200).json({
      message: "New Category created successfully",
      data: createCategory,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", data: error });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const id = req.params;

    const category = await Category.findOne({ id });

    if (!category) {
      return res.status(404).json({ message: "Category doesn't exist" });
    }

    return res
      .status(200)
      .json({ message: "Category found successfully", data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", data: error });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findOne({ isActive: true });

    if (!categories) {
      return res.status(404).json({ message: "Unable to find the categories" });
    }

    return res
      .status(200)
      .json({ message: "Categories Fetched successfully", data: categories });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", data: error });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const id = req.params;
    const { name, commisionRate, isActive } = req.body;

    const category = await Category.findById({ id });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Unable to find the desired category" });
    }

    const updatedFields = {};

    if (name) {
      updatedFields.name = name;
      updatedFields.slug = slugify(name, { lower: true, strict: true });
    }

    if (commisionRate !== undefined) {
      updatedFields.commisionRate = commisionRate;
    }

    if (isActive !== undefined) {
      updatedFields.isActive = isActive;
    }

    if (Object.keys(updatedFields).length() === 0) {
      return res.status(400).json({ message: "No changes to update" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Unable to update the category" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", data: error });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const id = req.params;
    const category = await Category.findById({ id });

    if (!category) {
      return res
        .status(404)
        .json({ message: "Unable to find the required category" });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(400).json({ message: "Unable to delete the category" });
    }

    return res
      .status(200)
      .json({
        message: "Category deleted Successfully",
        data: deletedCategory,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", data: error });
  }
};
