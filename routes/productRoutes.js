import { Router } from "express";
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";
import {
  createNewProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  softDeleteProduct,
  restoreDeletedProduct,
} from "../controllers/productControllers.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/product/create",
  protect,
  authorizeRoles("seller"),
  upload.array("images"),
  createNewProduct
);
router.get("/product/", getAllProducts);
router.get("/product/:id", getProductById);
router.put(
  "/product/update/:id",
  protect,
  authorizeRoles("admin", "seller"),
  upload.array("images"),
  updateProduct
);
router.delete(
  "/product/deleteProduct/:id",
  protect,
  authorizeRoles("seller", "admin"),
  softDeleteProduct
);
router.patch(
  "/product/restore/:id",
  protect,
  authorizeRoles("admin", "seller"),
  restoreDeletedProduct
);


export default router