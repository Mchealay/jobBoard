const Application = require("../models/application");
const Job = require("../models/job");
const User = require("../models/user");
const notificationController = require("./notificationController");

// Apply for a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (req.user.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Only job seekers can apply for jobs." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a resume file (.pdf or .docx)." });
    }

    // Verify job exists
    const job = await Job.findById(jobId).populate("employer", "name email");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if user already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      applicant: req.user.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    // Resume URL is the relative path from the server root
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const application = new Application({
      job: jobId,
      applicant: req.user.user.id,
      resumeUrl,
      coverLetter: coverLetter || ""
    });

    await application.save();

    // Send email alert to employer
    if (job.employer) {
      const applicantUser = await User.findById(req.user.user.id);
      await notificationController.sendApplicationNotification(
        job.employer.email,
        job.employer.name,
        job.title,
        applicantUser ? applicantUser.name : "A candidate"
      );
    }

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get job seeker's applications
exports.getJobseekerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.user.id })
      .populate({
        path: "job",
        populate: { path: "employer", select: "name email" }
      })
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get employer's received applications
exports.getEmployerJobApplications = async (req, res) => {
  try {
    // 1. Get all jobs posted by this employer
    const jobs = await Job.find({ employer: req.user.user.id });
    const jobIds = jobs.map(job => job._id);

    // 2. Find applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("applicant", "name email profile")
      .populate("job", "title location salary")
      .sort({ appliedAt: -1 });

    res.status(200).json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params; // Application ID

    if (!["Pending", "Interview", "Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const application = await Application.findById(id)
      .populate("applicant", "name email")
      .populate({
        path: "job",
        populate: { path: "employer" }
      });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify that the logged-in user is the employer who posted the job, or an admin
    const jobEmployerId = application.job.employer._id.toString();
    if (jobEmployerId !== req.user.user.id && req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this application status." });
    }

    application.status = status;
    await application.save();

    // Send email alert to applicant
    if (application.applicant) {
      await notificationController.sendStatusUpdateNotification(
        application.applicant.email,
        application.applicant.name,
        application.job.title,
        status
      );
    }

    res.status(200).json({ message: "Application status updated successfully", application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
