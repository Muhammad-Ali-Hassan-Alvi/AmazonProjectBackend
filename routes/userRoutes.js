import express from "express";
import { Router } from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser, logoutUser, refreshToken } from "../controllers/userControllers.js";
import { protect } from "../middleware/authMiddlware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile)
router.put("/updateProfile", protect, updateUserProfile)
router.delete("/deleteProfile", protect, deleteUser)
router.post("/logout", protect, logoutUser)
router.post("/refreshToken", refreshToken)


export default router;
