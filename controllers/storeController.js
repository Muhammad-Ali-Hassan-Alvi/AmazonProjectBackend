import Store from "../models/Store.js";
import Seller from "../models/Seller.js";

export const createNewStore = async (req, res) => {
  console.log("🚀 Store creation request received:", {
    method: req.method,
    url: req.url,
    body: req.body,
    user: req.user ? req.user.id : "No user",
  });

  try {
    // First, check if user is already a seller, if not create seller record
    let seller = await Seller.findOne({ userId: req.user.id });

    if (!seller) {
      console.log("📝 Creating seller record for user:", req.user.id);
      seller = new Seller({
        userId: req.user.id,
        products: [],
        earnings: 0,
        storeId: null,
      });
      await seller.save();
      console.log("✅ Seller record created:", seller);
    }

    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: seller._id });

    if (existingStore) {
      console.log("❌ Store already exists for seller:", seller._id);
      return res.status(400).json({
        message: "Store already exists for this seller",
        store: existingStore,
      });
    }

    // Validate required fields for store
    const { name, description, category, logo } = req.body;

    if (!name || !description || !category) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        message: "Name, description, and category are required",
      });
    }

    // Create new store
    const newStore = new Store({
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      owner: seller._id,
      logo: logo || "https://via.placeholder.com/150",
      products: [],
      rating: 0,
      numReviews: 0,
      isActive: true,
    });

    const savedStore = await newStore.save();
    const updatedSeller = await Seller.findByIdAndUpdate(
      seller._id,
      { storeId: savedStore._id },
      { new: true }
    );

    console.log("✅ Seller updated successfully with store ID:", updatedSeller);

    return res.status(201).json({
      message: "Store created successfully",
      store: savedStore,
      seller: seller,
    });
  } catch (error) {
    console.error("❌ Error creating store:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSellerStore = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });

    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    const store = await Store.findOne({ owner: seller._id }).populate(
      "products"
    );

    if (!store) {
      return res
        .status(404)
        .json({ message: "Store not found for this seller" });
    }

    return res.status(200).json({ store });
  } catch (error) {
    console.error("Error fetching seller's store: ", error);
  }
};

export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().populate("products");

    if (!stores) {
      return res
        .status(404)
        .json({ message: "There was an error in Fetching stores" });
    }
    return res.status(200).json({ stores });
  } catch (error) {
    console.error("Error fetching stores: ", error);
  }
};

export const getStorebyId = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate("products");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.status(200).json({ store });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStore = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });

    if (!seller) {
      return res.status(404).json({ message: "Seller profile not found" });
    }

    const store = await Store.findOne({ owner: seller._id }).populate(
      "products"
    );

    if (!store) {
      return res.status(404).json({ message: "Store is not found" });
    }

    store.name = req.body.name || store.name;
    store.category = req.body.category || store.category;
    store.logo = req.body.logo || store.logo;
    store.isActive = req.body.isActive || store.isActive;

    const updatedStore = await store.save();

    if (!updatedStore) {
      return res.status(403).json({ message: "Failed to update Store" });
    }

    return res
      .status(200)
      .json({ message: "Store updated successfully", store });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deactivateStore = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    if (!seller) {
      return res.status(404).json({ message: "User data not found" });
    }

    const store = await Store.findOne({ owner: seller._id });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    store.isActive = req.body.isActive;

    const updatedStore = store.save();

    if (!updatedStore) {
      return res.status(403).json({ message: "Failed to update Store" });
    }

    return res
      .status(200)
      .json({ message: "The store is updated successfully..", store });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteStore = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user._id });
    const storeId = await req.params.id;

    if (!seller) {
      return res
        .status(404)
        .json({ message: "Unable to find the user in our database" });
    }

    const store = await Store.findOne({ owner: req.user._id });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const updatedStore = store.deleteOne(storeId);
    if (updateStore) {
      return res.status(200).json({ message: "Store is deleted sucessfully " });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
