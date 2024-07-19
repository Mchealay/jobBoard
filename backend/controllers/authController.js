const User = require("../models/user");
const Job = require("../models/job");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User registration
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    user = new User({ name, email, password, role });
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    // Save user to database
    await user.save();

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id).select("-password").populate("savedJobs");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { bio, skills, contactPhone } = req.body;
  try {
    const user = await User.findById(req.user.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio !== undefined) user.profile.bio = bio;
    if (skills !== undefined) {
      // Split skills comma separated or assign directly if array
      user.profile.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());
    }
    if (contactPhone !== undefined) user.profile.contactPhone = contactPhone;

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", profile: user.profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Toggle Save/Unsave Job
exports.toggleSaveJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    const user = await User.findById(req.user.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobIndex = user.savedJobs.indexOf(jobId);
    let saved = false;

    if (jobIndex > -1) {
      // Already saved, remove it
      user.savedJobs.splice(jobIndex, 1);
    } else {
      // Add it
      user.savedJobs.push(jobId);
      saved = true;
    }

    await user.save();
    res.status(200).json({ saved, savedJobs: user.savedJobs, message: saved ? "Job saved successfully" : "Job removed from saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get Saved Jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.user.id).populate({
      path: "savedJobs",
      populate: { path: "employer", select: "name email" }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.savedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};