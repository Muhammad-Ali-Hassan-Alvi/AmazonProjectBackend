import Cart from "../models/Cart.js";
import Buyer from "../models/Buyer.js";
import { Product } from "../models/Product.js";

export const getUserCart = async (req, res) => {
  try {
    const user = await Buyer.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }

    const cart = await Cart.findOne({
      userId: user._id,
      status: "active",
    }).populate({ path: "items.productId", select: "name price images stock" });
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        message: "Cart not Found",
        data: {
          _id: cart?._id,
          items: [],
          default: 0,
        },
      });
    }

    return res
      .status(200)
      .json({ message: "Cart Fetched successfully.", data: cart });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not Found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough Stock" });
    }

    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer) {
      return res.status(404).json({ message: "Buyers record not Found" });
    }

    let cart = await Cart.findOne({ userId: buyer._id });

    if (!cart) {
      cart = new Cart({
        userId: buyer._id,
        items: [],
      });
    }

    const itemIndex = cart.items.findIndex(
      (p) => p.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    return res.status(200).json({
      message: "Item successfully added to cart",
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateItemQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer) {
      return res.status(404).json({ message: "Buyer profile not found" });
    }

    const cart = await Cart.findOne({ userId: buyer._id });

    if (!cart) {
      return res.status(404).json({ message: "Nothing in the cart " });
    }

    const itemIndex = cart.items.findIndex(
      (p) => p.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(404).json({ message: "Not enough stock" });
    }

    cart.items[itemIndex].quantity === quantity;

    await cart.save();

    const populatedCart = await cart.populate("items.productId");

    return res
      .status(200)
      .json({ message: "Cart is updated", data: populatedCart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const productId = req.params;
    const buyer = await Buyer.findOne({ userId: req.user.id });

    if (!buyer) {
      return res.status(404).json({ message: "Buyer Data not Found" });
    }

    const cart = await Cart.findOne({ userId: buyer._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      {
        $pull: { items: { productId: productId } },
      },
      { new: true }
    ).populate("items.productId");

    if (!updatedCart) {
      return res.status(400).json({ message: "Unable to delete item" });
    }

    await updatedCart.save();
    return res
      .status(200)
      .json({ message: "Cart Updated Successfully", data: updatedCart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", data: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    const cart = await Cart.findOne({ userId: buyer._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not Found for this User" });
    }

    cart.items = [];

    await cart.save();

    return res
      .status(200)
      .json({ message: "Cart Updated Successfully", data: cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server Error", data: error.message });
  }
};
