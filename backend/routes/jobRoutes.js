const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

// Create a job
router.post("/", authMiddleware, jobController.createJob);

// Get all jobs
router.get("/", jobController.getJobs);

// Search and filter jobs
router.get("/search", jobController.searchJobs);

module.exports = router;