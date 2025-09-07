import { Product } from "../models/Product";

export const createNewProduct = async (req, res) => {
  try {
    const imageUrls = req.files.map((file) => file.path);
    const product = await Product.create({
      ...req.body,
      images: imageUrls,
    });

    if (!product) {
      return res.status(400).json({ message: "Product creation failed" });
    }

    return res
      .status(201)
      .json({ message: "Product created Successfully", product });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No Products Found" });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Prouct not found!" });
    }

    return res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const imageUrls = req.files?.map((file) => file.path);

    const updatedData = {
      ...req.body,
      ...(imageUrls?.length ? { images: imageUrls } : {}),
    };

    const updated = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(400).json({ message: "Product not found " });
    }

    return res
      .status(200)
      .json({ message: "Product updated successfully", updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
