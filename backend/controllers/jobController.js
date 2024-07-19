const Job = require("../models/job");

// Create a new job posting
exports.createJob = async (req, res) => {
  try {
    const { title, description, location, salary, jobType, skillsRequired, experienceLevel } = req.body;
    
    // Ensure user is an employer or admin
    if (req.user.user.role !== "employer" && req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Only employers can post a job." });
    }

    const skills = Array.isArray(skillsRequired) 
      ? skillsRequired 
      : (skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : []);

    const job = new Job({ 
      title, 
      description, 
      location, 
      salary, 
      jobType,
      skillsRequired: skills,
      experienceLevel,
      employer: req.user.user.id 
    });

    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all jobs (with optional pagination)
exports.getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const totalJobs = await Job.countDocuments();
    const jobs = await Job.find()
      .populate("employer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Search and filter jobs with pagination
exports.searchJobs = async (req, res) => {
  try {
    const { keyword, location, minSalary, maxSalary, jobType, experienceLevel } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip = (page - 1) * limit;

    const filters = {};

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ];
    }

    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }

    if (minSalary || maxSalary) {
      filters.salary = {};
      if (minSalary) filters.salary.$gte = Number(minSalary);
      if (maxSalary) filters.salary.$lte = Number(maxSalary);
    }

    if (jobType) {
      filters.jobType = jobType;
    }

    if (experienceLevel) {
      filters.experienceLevel = experienceLevel;
    }

    if (req.query.employer) {
      filters.employer = req.query.employer;
    }

    const totalJobs = await Job.countDocuments(filters);
    const jobs = await Job.find(filters)
      .populate("employer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("employer", "name email");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update a job posting
exports.updateJob = async (req, res) => {
  try {
    const { title, description, location, salary, jobType, skillsRequired, experienceLevel } = req.body;
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify ownership (only creator or admin can edit)
    if (job.employer.toString() !== req.user.user.id && req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }

    const skills = Array.isArray(skillsRequired) 
      ? skillsRequired 
      : (skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : job.skillsRequired);

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.jobType = jobType || job.jobType;
    job.skillsRequired = skills;
    job.experienceLevel = experienceLevel || job.experienceLevel;

    const updatedJob = await job.save();
    res.status(200).json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a job posting
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Verify ownership (only creator or admin can delete)
    if (job.employer.toString() !== req.user.user.id && req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not authorized." });
    }

    await Job.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};