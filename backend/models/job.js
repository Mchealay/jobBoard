const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  salary: { 
    type: Number, 
    required: true 
  },
  employer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  jobType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
    required: true
  },
  skillsRequired: [{
    type: String
  }],
  experienceLevel: {
    type: String,
    enum: ["Entry", "Mid", "Senior"],
    default: "Entry"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Job", JobSchema);