import express from "express";
import { Router } from "express";
import {
  createNewStore,
  deactivateStore,
  deleteStore,
  getAllStores,
  getSellerStore,
  getStorebyId,
  updateStore,
} from "../controllers/storeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddlware.js";

const router = express.Router();

router.post("/createStore", protect, authorizeRoles("seller"), createNewStore);
router.get("/myStore", protect, authorizeRoles("seller"), getSellerStore);
router.get("/getAllStores", protect, getAllStores);
router.get("/getStorebyId/:id", protect, getStorebyId),
  router.put(
    "/updateStore",
    protect,
    authorizeRoles("seller", "admin"),
    updateStore
  );
router.patch(
  "/deactiveStore",
  protect,
  authorizeRoles("seller", "admin"),
  deactivateStore
);
router.delete(
  "/deleteStore/:id",
  protect,
  authorizeRoles("seller", "admin"),
  deleteStore
);

export default router;
