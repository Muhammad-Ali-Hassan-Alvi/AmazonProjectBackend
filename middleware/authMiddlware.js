import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getTokenFromRequest = (req) => {
  if (req?.cookies?.accessToken) return req.cookies.accessToken;
  if (req.headers.authorization?.startsWith("Bearer")) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

export const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "No Token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please refresh" });
    }
    return res
      .status(403)
      .json({ message: "Token is not valid", error: error.message });
  }
};

// export const admin = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({ message: "Access denied, Admins only" });
//   }

//   next();
// };



export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)){
      return res.status(403).json({ message: `Access denied, only [${roles.join(", ")}] allowed` });
    }

    next()
  }
}