# 🚀 Amazon Clone - Complete Development Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Authentication System](#authentication-system)
5. [API Endpoints](#api-endpoints)
6. [Database Models](#database-models)
7. [Middleware Implementation](#middleware-implementation)
8. [Frontend-Backend Integration](#frontend-backend-integration)
9. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

This is a full-stack Amazon clone with the following features:
- User authentication (register/login/logout)
- Role-based access control (User/Admin)
- Product management system
- Shopping cart functionality
- Order management
- User profiles and addresses
- Admin dashboard

---

## 🏗️ Backend Architecture

### Project Structure
```
azamon-backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── userControllers.js     # User authentication
│   ├── productControllers.js  # Product management
│   ├── orderControllers.js    # Order processing
│   └── adminControllers.js    # Admin operations
├── middleware/
│   ├── authMiddlware.js      # Authentication middleware
│   └── upload.js             # File upload handling
├── models/
│   ├── User.js               # User schema
│   ├── Product.js            # Product schema
│   ├── Order.js              # Order schema
│   └── Address.js            # Address schema
├── routes/
│   ├── userRoutes.js         # User endpoints
│   ├── productRoutes.js      # Product endpoints
│   ├── orderRoutes.js        # Order endpoints
│   └── adminRoutes.js        # Admin endpoints
├── server.js                 # Main server file
└── package.json
```

### Core Dependencies
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling
- **cors** - Cross-origin requests
- **multer** - File uploads
- **cloudinary** - Image storage

---

## 🔌 API Endpoints

### 1. User Routes
```javascript
// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddlware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile
} from "../controllers/userControllers.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.post("/logout", protect, logoutUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
```

### 2. Admin Routes
```javascript
// routes/adminRoutes.js
import express from "express";
import { protect, admin } from "../middleware/authMiddlware.js";
import {
  getDashboardStats,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders
} from "../controllers/adminControllers.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, admin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);

// Product management
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Order management
router.get("/orders", getAllOrders);

export default router;
```

### 3. Product Routes
```javascript
// routes/productRoutes.js
import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddlware.js";
import {
  getAllProducts,
  getProduct,
  searchProducts,
  addProductReview
} from "../controllers/productControllers.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/:id", getProduct);

// Protected routes
router.post("/:id/reviews", protect, addProductReview);

export default router;
```

---

## 🛡️ Middleware Implementation

### 1. Authentication Middleware
```javascript
// middleware/authMiddlware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from cookie or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No token provided." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        message: "Token is not valid. User not found." 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Token is not valid." 
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied. Admin role required." 
    });
  }
};
```

### 2. Rate Limiting Middleware
```javascript
// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## 🎮 Frontend Implementation

### 1. API Service
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  createProduct: (productData) => api.post('/admin/products', productData),
};

export default api;
```

### 2. Authentication Context
```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Protected Route Component
```javascript
// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

---

## 🚀 How to Use authMiddleware

### 1. Basic Protected Route
```javascript
// In your route files
import { protect } from "../middleware/authMiddlware.js";

// Public route
router.get("/products", getAllProducts);

// Protected route - requires authentication
router.get("/profile", protect, getUserProfile);
```

### 2. Admin-Only Routes
```javascript
import { protect, admin } from "../middleware/authMiddlware.js";

// Admin-only route - requires both authentication and admin role
router.get("/admin/users", protect, admin, getAllUsers);
router.delete("/admin/users/:id", protect, admin, deleteUser);
```

### 3. Middleware Chaining
```javascript
// You can chain multiple middleware functions
router.post("/admin/products", 
  protect,        // First: Check if user is authenticated
  admin,          // Second: Check if user is admin
  upload.single('image'), // Third: Handle file upload
  createProduct   // Finally: Execute the controller
);
```

### 4. Frontend Integration
```javascript
// In your React components
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
};
```

---

## 🔧 Development Setup

### Backend Setup
```bash
# Install dependencies
npm install

# Create .env file
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Create React app
npx create-react-app azamon-frontend

# Install dependencies
npm install axios react-router-dom

# Start development server
npm start
```

---

## 📱 Key Features to Implement

1. **User Management**
   - Registration/Login/Logout
   - Profile management
   - Address management

2. **Product Management**
   - Product CRUD operations
   - Image uploads
   - Categories and search

3. **Shopping Cart**
   - Add/remove items
   - Quantity management
   - Persistent cart

4. **Order Management**
   - Order creation
   - Order tracking
   - Payment integration

5. **Admin Dashboard**
   - User management
   - Product management
   - Order management
   - Analytics and reports

---

## 🔒 Security Best Practices

1. **Always use HTTPS in production**
2. **Implement rate limiting for auth endpoints**
3. **Validate all user inputs**
4. **Use environment variables for secrets**
5. **Implement proper error handling**
6. **Add request logging**
7. **Use helmet.js for security headers**

---

This documentation provides a comprehensive guide for your Amazon clone project. The authMiddleware is the core of your authentication system and can be easily extended for different user roles and permissions.
