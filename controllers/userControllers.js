import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";
import Buyer from "../models/Buyer.js";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" }); // Added return
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // if (role === "seller") {
    //   return res
    //     .status(400)
    //     .json({ message: "Shpo nsme is required for sellers" });
    // }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (user.role === "buyer") {
      await Buyer.create({ userId: user._id });
    } else if (role === "seller") {
      await Seller.create({ userId: user._id });
    }

    return res.status(201).json({
      // Added return
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    // });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "10d",
      }
    );

    const refreshTokens = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" }
    );

    user.refreshTokens.push({ token: refreshTokens });
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "Lax",
      // secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 10, // 30 days
    });

    res.cookie("refreshToken", refreshTokens, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User Record not found" });
    }

    let profile = null;
    if (user.role === "buyer") {
      profile = await Buyer.findOne({ userId: user._id })
        .populate("whishlist.productId")
        .populate("cart.productId");
    } else if (user.role === "seller") {
      profile = await Seller.findOne({ userId: user._id }).populate(
        "products.productId"
      );
    }

    return res.status(200).json({ user, profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User Record not Found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "User Profile Updated Successfully",
      user: {
        user: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User Record not Found" });
    }

    await User.findByIdAndDelete(req.user.id);
    if (user.role === "buyer") {
      await Buyer.findByIdAndDelete({ userId: user._id });
    } else if (user.role === "seller") {
      await Seller.findByIdAndDelete({ userId: user._id });
    }
    return res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const user = await User.findOne({ "refreshTokens.token": refreshToken });

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (t) => t.token !== refreshToken
        );

        await user.save();
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ message: "No Refresh Token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      "refreshTokens.token": refreshToken,
    });

    if (!user) {
      return res.status(403).json({ message: "Refresh Token is not valid" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 15,
    });

    return res.status(200).json({ message: "Access Token Refreshed" });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Refresh Token is not valid", error: error.message });
  }
};
