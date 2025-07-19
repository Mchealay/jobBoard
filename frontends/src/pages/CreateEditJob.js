import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CreateEditJob = () => {
  const { id } = useParams(); // If present, we are in EDIT mode
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    jobType: "Full-time",
    experienceLevel: "Entry",
    skillsRequired: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchJobToEdit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      const jobData = res.data;

      // Verify ownership (only employer owner or admin can edit)
      if (jobData.employer?._id !== user?.id && user?.role !== "admin") {
        alert("Not authorized to edit this job post.");
        navigate("/");
        return;
      }

      setFormData({
        title: jobData.title || "",
        description: jobData.description || "",
        location: jobData.location || "",
        salary: jobData.salary || "",
        jobType: jobData.jobType || "Full-time",
        experienceLevel: jobData.experienceLevel || "Entry",
        skillsRequired: jobData.skillsRequired?.join(", ") || ""
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch job posting details for editing.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

  useEffect(() => {
    // Only employers or admins allowed
    if (user && user.role !== "employer" && user.role !== "admin") {
      alert("Access Denied. Only employers can manage job posts.");
      navigate("/");
    }

    if (isEditMode) {
      fetchJobToEdit();
    }
  }, [isEditMode, fetchJobToEdit, navigate, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        salary: Number(formData.salary)
      };

      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/jobs/${id}`, payload);
        alert("Job posting updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/jobs", payload);
        alert("Job posting created successfully!");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to process job post request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="main-content">
      <div className="glass-panel" style={{ maxWidth: "700px", margin: "2rem auto" }}>
        <h2 style={{ marginBottom: "1.5rem" }}>
          {isEditMode ? "Edit Job Posting" : "Post a New Job Opening"}
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              name="title"
              className="form-control"
              placeholder="e.g. Senior Full Stack Engineer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="jobType">Job Category Type</label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                className="form-control"
                placeholder="e.g. San Francisco, CA / Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Annual Salary ($/yr)</label>
              <input
                id="salary"
                type="number"
                name="salary"
                className="form-control"
                placeholder="e.g. 120000"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="skillsRequired">Skills Required (comma separated)</label>
            <input
              id="skillsRequired"
              type="text"
              name="skillsRequired"
              className="form-control"
              placeholder="e.g. React, Node.js, MongoDB, AWS"
              value={formData.skillsRequired}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Job Description / Requirements</label>
            <textarea
              id="description"
              name="description"
              rows="8"
              placeholder="Provide a detailed job description, duties, qualifications..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={submitting}
            >
              {submitting ? "Processing..." : isEditMode ? "Save Changes" : "Post Opening"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditJob;
