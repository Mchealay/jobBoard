const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Get statistics for admin dashboard (Admin only)
router.get("/stats", authMiddleware, adminController.getDashboardStats);

// Get list of all users (Admin only)
router.get("/users", authMiddleware, adminController.getAllUsers);

// Delete user and their associated data (Admin only)
router.delete("/users/:id", authMiddleware, adminController.deleteUser);

module.exports = router;
