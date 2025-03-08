const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const jobController = require("../controllers/jobController");
//const authMiddleware = require("../middleware/authMiddleware");

// User registration
router.post("/register", authController.register);

// User login
router.post("/login", authController.login);

// Create a job
router.post("/job", jobController.createJob);


module.exports = router;