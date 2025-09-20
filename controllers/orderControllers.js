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

    const cart = await Cart.findOne({
      userId: buyer._id,
      status: "active",
    }).populate({
      path: "items.productId",
      select: "name stock storeId", 
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const totalAmount = cart.total;

    for (const item of cart.items) {
      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for '${item.productId.name}'. Available: ${item.productId.stock}, Requested: ${item.quantity}.`,
        });
      }
    }

    const order = await Order.create({
      userId: buyer._id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        storeId: item.productId.storeId, 
      })),
      totalAmount,
      shippingAddress,
      payment: { method: "COD", status: "pending" },
    });

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
      return res
        .status(404)
        .json({
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
      return res
        .status(400)
        .json({
          message: "Order cannot be canceled once it has been shipped.",
        });
    }

    orderToCancel.status = "cancelled";

    await orderToCancel.save();
    return res
      .status(200)
      .json({
        message: "Order is canceled successfully.",
        data: orderToCancel,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

// --- UPDATE ORDER STATUS (FOR SELLER/ADMIN) ---
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

    // This logic is correct and well-implemented.
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
    // FIX: Find the seller profile using the authenticated user's ID
    const seller = await Seller.findOne({ userId: req.user.id });
    if (!seller)
      return res.status(404).json({ message: "Seller profile not found." });
    if (!seller.storeId)
      return res
        .status(404)
        .json({ message: "This seller does not have an active store." });

    // The rest of your logic here was already correct!
    const orders = await Order.find({ "items.storeId": seller.storeId })
      .populate("items.productId", "title price images")
      .populate("userId", "name email") // It's helpful for sellers to see buyer info
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
