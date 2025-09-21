import express from "express";
import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";
import { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus, 
  cancelOrder,
  getStoreOrders 
} from "../controllers/orderControllers.js";

const router = express.Router();


router.post("/create", protect, authorizeRoles("buyer"), createOrder);
router.get("/getOrders", protect, authorizeRoles("buyer", "admin"), getUserOrders);
router.get("/store/all", protect, authorizeRoles("seller"), getStoreOrders);
router.get("/:id", protect, authorizeRoles("buyer"), getOrderById);
router.put("/cancel/:id", protect, authorizeRoles("buyer"), cancelOrder);
router.put("/update/:id", protect, authorizeRoles("seller"), updateOrderStatus);

export default router;