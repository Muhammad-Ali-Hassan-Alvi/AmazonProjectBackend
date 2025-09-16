import { Product } from "../models/Product.js";
import Seller from "../models/Seller.js";
import Store from "../models/Store.js";

export const createNewProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "Seller record not found" });
    }

    const store = await Store.findById(seller.storeId);
    if (!store) {
      return res.status(404).json({ message: "Unable to find your Store" });
    }

    const imageUrls = req.files.map((file) => file.path);
    const product = await Product.create({
      ...req.body,
      images: imageUrls,
      seller: seller._id,
      store: store._id,
    });

    store.products.push(product._id);
    await store.save();

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
    const { category, search, isFeatured } = req.query;

    let filter = { isActive: true, deletedAt: null };

    if (category) filter.category = category;
    if (search) filter.search = search;

    let query = Product.find(filter).sort({ createdAt: -1 });

    if (search) {
      query = Product.find({ keywords: { $regex: search, $options: "i" } });
    }

    const products = await query.populate("store seller");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    return res.status(200).json({ products });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id).populate("store seller");
    if (!product || product.deletedAt) {
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

export const softDeleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(200).json({ message: "Product not Found" });
    }

    product.isActive = false;
    product.deletedAt = new Date();

    await product.save();

    return res.status(200).json({ message: "Product deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const restoreDeletedProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Unable to find the Product" });
    }

    product.isActive = true;
    product.deletedAt = null;

    await product.save();

    return res.status(200).json({ message: "The Product is Active" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
