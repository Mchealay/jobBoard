const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Apply to a job with resume upload (Jobseeker only)
router.post("/apply", authMiddleware, uploadMiddleware.single("resume"), applicationController.applyToJob);

// Get logged-in seeker's applications (Jobseeker only)
router.get("/seeker", authMiddleware, applicationController.getJobseekerApplications);

// Get applications received for jobs posted by the employer (Employer only)
router.get("/employer", authMiddleware, applicationController.getEmployerJobApplications);

// Update status of an application (Employer owner / Admin only)
router.put("/status/:id", authMiddleware, applicationController.updateApplicationStatus);

module.exports = router;
