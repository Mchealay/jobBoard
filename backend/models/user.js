const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ["employer", "jobseeker", "admin"], 
    default: "jobseeker" 
  },
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],
  profile: {
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    contactPhone: { type: String, default: "" },
    resumeUrl: { type: String, default: "" }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);