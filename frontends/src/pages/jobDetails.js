import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, toggleSaveJob } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Apply Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ type: "", text: "" });
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load job details. The job opening may not exist.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkApplicationStatus = useCallback(async () => {
    if (isAuthenticated && user?.role === "jobseeker") {
      try {
        const res = await axios.get("http://localhost:5000/api/applications/seeker");
        const applied = res.data.some(app => app.job?._id === id);
        setAlreadyApplied(applied);
      } catch (err) {
        console.error("Error checking application status", err);
      }
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  useEffect(() => {
    checkApplicationStatus();
  }, [checkApplicationStatus]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await toggleSaveJob(job._id);
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setApplyMessage({ type: "error", text: "Please upload a resume file (.pdf, .doc, .docx)." });
      return;
    }

    setApplying(true);
    setApplyMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("jobId", id);
    formData.append("coverLetter", coverLetter);
    formData.append("resume", resumeFile);

    try {
      await axios.post("http://localhost:5000/api/applications/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setApplyMessage({ type: "success", text: "Your application was submitted successfully!" });
      setAlreadyApplied(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setCoverLetter("");
        setResumeFile(null);
        setApplyMessage({ type: "", text: "" });
      }, 2000);
    } catch (err) {
      console.error(err);
      setApplyMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit application."
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="main-content"><div className="alert alert-error">{error}</div><Link to="/" className="btn btn-secondary">Back to Job List</Link></div>;
  if (!job) return null;

  const isSaved = user?.savedJobs?.includes(job._id) || false;
  const isSeeker = user?.role === "jobseeker";
  const isEmployer = user?.role === "employer";
  const isAdmin = user?.role === "admin";

  return (
    <div className="main-content">
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: "1.5rem" }}>
        &larr; Back to Openings
      </Link>

      <div className="details-grid">
        {/* Main Details Panel */}
        <div className="details-main">
          <div className="glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h1 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>{job.title}</h1>
                <p style={{ fontSize: "1.05rem", color: "var(--color-primary)", fontWeight: "600", marginBottom: "0" }}>
                  {job.employer?.name || "Company Name"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {isAuthenticated && isSeeker && (
                  <button onClick={handleSaveToggle} className="btn btn-secondary">
                    {isSaved ? "⭐ Saved" : "☆ Save"}
                  </button>
                )}
                {!isAuthenticated && (
                  <button onClick={handleSaveToggle} className="btn btn-secondary">
                    ☆ Save
                  </button>
                )}
              </div>
            </div>

            <div className="job-tags" style={{ marginBottom: "1.5rem" }}>
              <span className="tag tag-type">{job.jobType}</span>
              <span className="tag tag-location">{job.location}</span>
              <span className="tag tag-experience">{job.experienceLevel} Level</span>
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", marginTop: "1.5rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Job Description</h3>
              <div style={{ whiteSpace: "pre-line", color: "var(--text-secondary)", lineHeight: "1.7" }}>
                {job.description}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="details-sidebar">
          <div className="glass-panel">
            <h3 style={{ marginBottom: "1.25rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              Job Summary
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Salary Range</span>
                <strong style={{ fontSize: "1.25rem", color: "var(--color-success)" }}>
                  ${job.salary?.toLocaleString()} / year
                </strong>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Location</span>
                <strong style={{ color: "#ffffff" }}>{job.location}</strong>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Job Category Type</span>
                <strong style={{ color: "#ffffff" }}>{job.jobType}</strong>
              </div>

              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Experience Required</span>
                <strong style={{ color: "#ffffff" }}>{job.experienceLevel} Level</strong>
              </div>

              {job.skillsRequired && job.skillsRequired.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>
                    Skills Required
                  </span>
                  <div className="skills-list">
                    {job.skillsRequired.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "1.5rem", paddingTop: "1.5rem" }}>
              {isEmployer && (
                <div className="alert alert-success" style={{ fontSize: "0.85rem", margin: 0 }}>
                  You listed this opening. Check applicants inside your Panel.
                </div>
              )}
              {isAdmin && (
                <div className="alert alert-success" style={{ fontSize: "0.85rem", margin: 0 }}>
                  You are viewing this job details as an Administrator.
                </div>
              )}
              {(!isAuthenticated || isSeeker) && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) navigate("/login");
                    else setShowApplyModal(true);
                  }}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={alreadyApplied}
                >
                  {alreadyApplied ? "Already Applied" : "Apply for Job"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ animation: "spin 0s" }}>
            <button className="modal-close" onClick={() => setShowApplyModal(false)}>
              &times;
            </button>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <p>Submit your resume and details to the employer</p>
            </div>

            {applyMessage.text && (
              <div className={`alert alert-${applyMessage.type}`}>
                {applyMessage.text}
              </div>
            )}

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label htmlFor="coverLetter">Cover Letter / Note</label>
                <textarea
                  id="coverLetter"
                  rows="4"
                  placeholder="Introduce yourself and explain why you're a fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Upload Resume (.pdf, .doc, .docx)</label>
                <div className="file-upload-box">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="resume-file-input"
                    required
                  />
                  <label htmlFor="resume-file-input" style={{ cursor: "pointer", display: "block", margin: 0 }}>
                    <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>📄</span>
                    {resumeFile ? (
                      <strong style={{ color: "var(--color-primary)" }}>{resumeFile.name}</strong>
                    ) : (
                      <>
                        <strong>Choose a file</strong> or drag it here
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          PDF, DOC, DOCX up to 5MB
                        </span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn-secondary"
                  disabled={applying}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={applying}>
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;