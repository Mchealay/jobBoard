const User = require("../models/user");
const Job = require("../models/job");
const Application = require("../models/application");

// Get statistics for admin dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // User counts by role
    const totalUsers = await User.countDocuments();
    const jobseekersCount = await User.countDocuments({ role: "jobseeker" });
    const employersCount = await User.countDocuments({ role: "employer" });
    const adminsCount = await User.countDocuments({ role: "admin" });

    // Applications counts by status
    const pendingApps = await Application.countDocuments({ status: "Pending" });
    const interviewApps = await Application.countDocuments({ status: "Interview" });
    const acceptedApps = await Application.countDocuments({ status: "Accepted" });
    const rejectedApps = await Application.countDocuments({ status: "Rejected" });

    res.status(200).json({
      stats: {
        totalJobs,
        totalApplications,
        totalUsers,
        usersByRole: {
          jobseeker: jobseekersCount,
          employer: employersCount,
          admin: adminsCount
        },
        applicationsByStatus: {
          Pending: pendingApps,
          Interview: interviewApps,
          Accepted: acceptedApps,
          Rejected: rejectedApps
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all users list
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete a user (and cleanup their data)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cleanup: 
    if (user.role === "employer") {
      // Find employer's jobs
      const jobs = await Job.find({ employer: userId });
      const jobIds = jobs.map(j => j._id);
      // Remove all applications for their jobs
      await Application.deleteMany({ job: { $in: jobIds } });
      // Delete jobs
      await Job.deleteMany({ employer: userId });
    } else if (user.role === "jobseeker") {
      // Remove jobseeker's applications
      await Application.deleteMany({ applicant: userId });
    }

    // Delete user
    await User.deleteOne({ _id: userId });
    res.status(200).json({ message: "User and associated data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
