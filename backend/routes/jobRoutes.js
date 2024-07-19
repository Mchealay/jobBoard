const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

// Get all jobs (Public, Paginated)
router.get("/", jobController.getJobs);

// Search and filter jobs (Public, Paginated)
router.get("/search", jobController.searchJobs);

// Get single job by ID (Public)
router.get("/:id", jobController.getJobById);

// Create a new job posting (Employer / Admin only)
router.post("/", authMiddleware, jobController.createJob);

// Update a job posting (Owner / Admin only)
router.put("/:id", authMiddleware, jobController.updateJob);

// Delete a job posting (Owner / Admin only)
router.delete("/:id", authMiddleware, jobController.deleteJob);

module.exports = router;