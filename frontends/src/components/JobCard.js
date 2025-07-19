import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobCard = ({ job, isSaved, onSaveToggle }) => {
  const { isAuthenticated, user } = useAuth();
  const isSeeker = user?.role === "jobseeker";

  return (
    <div className="glass-panel job-card">
      <div>
        <div className="job-card-header">
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>{job.title}</h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
              Posted by {job.employer?.name || "Employer"}
            </span>
          </div>
          {isAuthenticated && isSeeker && onSaveToggle && (
            <button
              onClick={() => onSaveToggle(job._id)}
              className="btn btn-secondary btn-sm"
              style={{ padding: "0.35rem 0.5rem" }}
              title={isSaved ? "Unsave Job" : "Save Job"}
            >
              {isSaved ? "⭐" : "☆"}
            </button>
          )}
        </div>

        <div className="job-tags">
          <span className="tag tag-type">{job.jobType}</span>
          <span className="tag tag-location">{job.location}</span>
          <span className="tag tag-experience">{job.experienceLevel} Level</span>
        </div>

        <p style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontSize: "0.9rem",
          marginBottom: "1rem"
        }}>
          {job.description}
        </p>
      </div>

      <div className="job-card-footer">
        <span className="job-salary">
          ${job.salary?.toLocaleString()}/yr
        </span>
        <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
