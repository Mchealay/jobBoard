const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Register User
router.post("/register", authController.register);

// Login User
router.post("/login", authController.login);

// Get User Profile
router.get("/profile", authMiddleware, authController.getProfile);

// Update User Profile
router.put("/profile", authMiddleware, authController.updateProfile);

// Toggle Save/Unsave Job
router.post("/save/:jobId", authMiddleware, authController.toggleSaveJob);

// Get Saved Jobs
router.get("/saved", authMiddleware, authController.getSavedJobs);

module.exports = router;