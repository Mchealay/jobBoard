const Job = require("../models/job");

// Create a new job posting
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, salary } = req.body;
    const job = new Job({ title, description, location, salary, employer: req.user.id });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("employer", "name email");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Search and filter jobs
exports.searchJobs = async (req, res) => {
  try {
    const { location, salary } = req.query;
    const filters = {};
    if (location) filters.location = location;
    if (salary) filters.salary = { $gte: salary };
    const jobs = await Job.find(filters).populate("employer", "name email");
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};