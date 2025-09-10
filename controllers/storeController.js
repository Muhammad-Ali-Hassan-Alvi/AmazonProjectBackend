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

