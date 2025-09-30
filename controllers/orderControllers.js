import Order from "../models/Order.js";
import Buyer from "../models/Buyer.js";
import Cart from "../models/Cart.js";
import { Product } from "../models/Product.js";
import Seller from "../models/Seller.js";

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer)
      return res.status(404).json({ message: "Buyer profile not found." });

    // This populate logic is PERFECT. You did a great job here.
    const cart = await Cart.findOne({
      userId: buyer._id,
      status: "active",
    }).populate({
      path: "items.productId",
      select: "title price stock store", 
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Initialize totals
    let totalAmount = 0;
    let totalPlatformFee = 0; // placeholder if you add commissions later
    let totalSellerEarnings = 0;

    // --- CALCULATION LOOP ---
    for (const item of cart.items) {
      if (!item.productId) {
        throw new Error(`Product data is incomplete for an item. Cannot calculate totals.`);
      }

      // Always trust product.price from populated product, not item.price if uncertain
      const unitPrice = Number(item.price ?? item.productId.price);
      const qty = Number(item.quantity);
      if (!Number.isFinite(unitPrice) || !Number.isFinite(qty)) {
        throw new Error(`Invalid price or quantity for product ${item.productId?._id}`);
      }

      const itemTotal = unitPrice * qty;
      totalAmount += itemTotal;
    }

    totalSellerEarnings = totalAmount - totalPlatformFee;

    // Check stock *after* calculating, just in case
    for (const item of cart.items) {
      if (item.productId.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${item.productId.name}.` });
      }
    }

    // --- CREATE THE PERMANENT ORDER RECORD ---
    const order = await Order.create({
      userId: buyer._id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price ?? item.productId.price,
        storeId: item.productId.store,
      })),
      shippingAddress,
      payment: { method: "COD", status: "pending" },

      // Save numeric totals
      totalAmount: Number(totalAmount),
      platformFee: Number(totalPlatformFee),
      sellerEarnings: Number(totalSellerEarnings),
    });

    // Clear the cart
    cart.items = [];
    cart.status = "ordered";
    await cart.save();

    return res
      .status(201)
      .json({ message: "Order placed successfully!", data: order });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer)
      return res.status(404).json({ message: "Buyer profile not found." });

    const orders = await Order.find({ userId: buyer._id })
      .populate("items.productId", "title images")
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res
        .status(200)
        .json({ message: "You have no orders currently.", data: [] });
    }

    return res
      .status(200)
      .json({ message: "Orders fetched successfully.", data: orders });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer)
      return res.status(404).json({ message: "Buyer profile not found." });

    const order = await Order.findOne({ _id: id, userId: buyer._id }).populate(
      "items.productId"
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found or you do not have permission to view it.",
      });
    }

    return res
      .status(200)
      .json({ message: "Order received successfully.", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const buyer = await Buyer.findOne({ userId: req.user.id });
    if (!buyer)
      return res.status(404).json({ message: "Buyer profile not found." });

    const orderToCancel = await Order.findOne({ _id: id, userId: buyer._id });
    if (!orderToCancel)
      return res.status(404).json({ message: "Order not found." });

    if (
      orderToCancel.status !== "pending" &&
      orderToCancel.status !== "processing"
    ) {
      return res.status(400).json({
        message: "Order cannot be canceled once it has been shipped.",
      });
    }

    orderToCancel.status = "cancelled";

    await orderToCancel.save();
    return res.status(200).json({
      message: "Order is canceled successfully.",
      data: orderToCancel,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const oldStatus = order.status;
    const allowedStatuses = ["processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status update." });

    
    if (status === "shipped" && oldStatus !== "shipped") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, sold: +item.quantity },
        });
      }
    } else if (status === "cancelled" && oldStatus === "shipped") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: +item.quantity, sold: -item.quantity },
        });
      }
    }

    if (status === "delivered" && order.payment.method === "COD") {
      order.payment.status = "paid";
    }

    order.status = status;
    await order.save();
    return res
      .status(200)
      .json({ message: "Order status updated successfully.", data: order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getStoreOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller)
      return res.status(404).json({ message: "Seller profile not found." });
    if (!seller.storeId)
      return res
        .status(404)
        .json({ message: "This seller does not have an active store." });

    const orders = await Order.find({ "items.storeId": seller.storeId })
      .populate("items.productId", "title price images")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res
        .status(200)
        .json({ message: "Your store has no orders yet.", data: [] });
    }

    return res
      .status(200)
      .json({ message: "Store orders fetched successfully.", data: orders });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
