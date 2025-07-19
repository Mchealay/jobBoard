import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout, updateProfile, toggleSaveJob } = useAuth();
  const navigate = useNavigate();

  // Selected Tab based on role
  const getInitialTab = useCallback(() => {
    if (user?.role === "admin") return "overview";
    if (user?.role === "employer") return "jobs";
    return "applied";
  }, [user]);

  const [activeTab, setActiveTab] = useState(getInitialTab());

  // Jobseeker States
  const [myApplications, setMyApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [profileForm, setProfileForm] = useState({
    bio: "",
    skills: "",
    contactPhone: ""
  });
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Employer States
  const [myPostedJobs, setMyPostedJobs] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);

  // Admin States
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminJobs, setAdminJobs] = useState([]);

  // Common Loading state
  const [loading, setLoading] = useState(true);

  // Initialize profile form
  useEffect(() => {
    if (user && user.profile) {
      setProfileForm({
        bio: user.profile.bio || "",
        skills: user.profile.skills?.join(", ") || "",
        contactPhone: user.profile.contactPhone || ""
      });
    }
  }, [user]);

  // Set active tab on load
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [user, getInitialTab]);

  // 1. Fetch Jobseeker Data
  const fetchJobseekerData = useCallback(async () => {
    setLoading(true);
    try {
      const appsRes = await axios.get("http://localhost:5000/api/applications/seeker");
      setMyApplications(appsRes.data);

      const savedRes = await axios.get("http://localhost:5000/api/auth/saved");
      setSavedJobs(savedRes.data);
    } catch (err) {
      console.error("Error loading jobseeker dashboard details", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Employer Data
  const fetchEmployerData = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const jobsRes = await axios.get(`http://localhost:5000/api/jobs/search?employer=${user.id}`);
        setMyPostedJobs(jobsRes.data.jobs || []);
      }
      
      const appsRes = await axios.get("http://localhost:5000/api/applications/employer");
      setReceivedApplications(appsRes.data);
    } catch (err) {
      console.error("Error loading employer dashboard details", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 3. Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await axios.get("http://localhost:5000/api/admin/stats");
      setAdminStats(statsRes.data.stats);

      const usersRes = await axios.get("http://localhost:5000/api/admin/users");
      setAdminUsers(usersRes.data);

      const jobsRes = await axios.get("http://localhost:5000/api/jobs?limit=100");
      setAdminJobs(jobsRes.data.jobs || []);
    } catch (err) {
      console.error("Error loading admin details", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Central Router for fetching tab information
  const loadDashboardData = useCallback(() => {
    if (!user) return;
    if (user.role === "jobseeker") {
      fetchJobseekerData();
    } else if (user.role === "employer") {
      fetchEmployerData();
    } else if (user.role === "admin") {
      fetchAdminData();
    }
  }, [user, fetchJobseekerData, fetchEmployerData, fetchAdminData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: "", text: "" });
    const res = await updateProfile(profileForm);
    if (res.success) {
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } else {
      setProfileMsg({ type: "error", text: res.message });
    }
  };

  // Seeker unsaves a job
  const handleUnsaveJob = async (jobId) => {
    await toggleSaveJob(jobId);
    // Reload seeker data
    fetchJobseekerData();
  };

  // Employer updates application status
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/applications/status/${appId}`, { status: newStatus });
      alert("Application status updated and candidate notified!");
      fetchEmployerData();
    } catch (err) {
      console.error(err);
      alert("Failed to update application status.");
    }
  };

  // Employer deletes a job posting
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      alert("Job posting deleted.");
      fetchEmployerData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job posting.");
    }
  };

  // Admin deletes user
  const handleAdminDeleteUser = async (userId) => {
    if (userId === user.id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user and all associated jobs/applications?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`);
      alert("User account deleted.");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // Admin deletes job
  const handleAdminDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      alert("Job post deleted.");
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job.");
    }
  };

  if (!user) {
    return (
      <div className="main-content">
        <div className="alert alert-error">Please log in to access the dashboard.</div>
        <Link to="/login" className="btn btn-primary">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <span className="user-badge" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
            {user.role} Dashboard
          </span>
          <h1>Welcome, {user.name}</h1>
          <p style={{ margin: 0 }}>Manage your account, jobs, and settings here.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar Tabs */}
        <div className="dashboard-sidebar">
          {/* Jobseeker Tabs */}
          {user.role === "jobseeker" && (
            <>
              <button
                className={`sidebar-tab-btn ${activeTab === "applied" ? "active" : ""}`}
                onClick={() => setActiveTab("applied")}
              >
                My Applications
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === "saved" ? "active" : ""}`}
                onClick={() => setActiveTab("saved")}
              >
                Saved Jobs ({savedJobs.length})
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Edit My Profile
              </button>
            </>
          )}

          {/* Employer Tabs */}
          {user.role === "employer" && (
            <>
              <button
                className={`sidebar-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
                onClick={() => setActiveTab("jobs")}
              >
                My Job Posts ({myPostedJobs.length})
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === "applications" ? "active" : ""}`}
                onClick={() => setActiveTab("applications")}
              >
                Received Applications ({receivedApplications.length})
              </button>
            </>
          )}

          {/* Admin Tabs */}
          {user.role === "admin" && (
            <>
              <button
                className={`sidebar-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                Overview Stats
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                Manage Users ({adminUsers.length})
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === "jobs" ? "active" : ""}`}
                onClick={() => setActiveTab("jobs")}
              >
                Manage Jobs ({adminJobs.length})
              </button>
            </>
          )}

          <hr style={{ border: "none", borderTop: "1px solid var(--border-color)", margin: "1rem 0" }} />
          <button onClick={logout} className="sidebar-tab-btn" style={{ color: "var(--color-error)" }}>
            Log Out Account
          </button>
        </div>

        {/* Dynamic Tab Workspaces */}
        <div className="dashboard-content">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <>
              {/* ================== JOBSEEKER WORKSPACE ================== */}
              {user.role === "jobseeker" && (
                <>
                  {activeTab === "applied" && (
                    <div>
                      <h2>My Submitted Applications</h2>
                      <p>Track statuses for job applications you've submitted.</p>
                      
                      {myApplications.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
                          <p>You haven't submitted any job applications yet.</p>
                          <Link to="/" className="btn btn-primary btn-sm">Explore Open Jobs</Link>
                        </div>
                      ) : (
                        <div className="dashboard-table-wrapper">
                          <table className="dashboard-table">
                            <thead>
                              <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Applied Date</th>
                                <th>Cover Letter</th>
                                <th>Resume</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {myApplications.map((app) => (
                                <tr key={app._id}>
                                  <td>
                                    {app.job ? (
                                      <Link to={`/jobs/${app.job._id}`} style={{ fontWeight: 600 }}>
                                        {app.job.title}
                                      </Link>
                                    ) : (
                                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Deleted Job</span>
                                    )}
                                  </td>
                                  <td>{app.job?.employer?.name || "N/A"}</td>
                                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                  <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={app.coverLetter}>
                                    {app.coverLetter || "None"}
                                  </td>
                                  <td>
                                    <a
                                      href={`http://localhost:5000${app.resumeUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                                    >
                                      Download 📥
                                    </a>
                                  </td>
                                  <td>
                                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                      {app.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "saved" && (
                    <div>
                      <h2>Bookmarked Saved Jobs</h2>
                      <p>View or apply to jobs you bookmarked for later.</p>

                      {savedJobs.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
                          <p>You haven't bookmarked any jobs yet.</p>
                          <Link to="/" className="btn btn-primary btn-sm">Explore Open Jobs</Link>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginTop: "1rem" }}>
                          {savedJobs.map((job) => (
                            <div key={job._id} className="glass-panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <h3 style={{ marginBottom: "0.25rem" }}>
                                  <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                                </h3>
                                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                                  {job.employer?.name} &bull; {job.location} &bull; ${job.salary?.toLocaleString()}/yr
                                </p>
                              </div>
                              <button
                                onClick={() => handleUnsaveJob(job._id)}
                                className="btn btn-danger btn-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "profile" && (
                    <div className="glass-panel">
                      <h2>My Profile Details</h2>
                      <p>Update qualifications and details accessed by employers during submissions.</p>

                      {profileMsg.text && (
                        <div className={`alert alert-${profileMsg.type}`}>
                          {profileMsg.text}
                        </div>
                      )}

                      <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                          <label htmlFor="bio">Professional Summary / Bio</label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows="4"
                            placeholder="Write a brief professional summary..."
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="skills">Key Skills (comma separated)</label>
                          <input
                            id="skills"
                            type="text"
                            name="skills"
                            className="form-control"
                            placeholder="e.g. React, Node.js, SQL, Java"
                            value={profileForm.skills}
                            onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="contactPhone">Contact Phone Number</label>
                          <input
                            id="contactPhone"
                            type="tel"
                            name="contactPhone"
                            className="form-control"
                            placeholder="+1 (555) 000-0000"
                            value={profileForm.contactPhone}
                            onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                          />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                          Save Profile Changes
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* ================== EMPLOYER WORKSPACE ================== */}
              {user.role === "employer" && (
                <>
                  {activeTab === "jobs" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <div>
                          <h2>Active Job Openings</h2>
                          <p>Manage role detail entries and see postings listed by your organization.</p>
                        </div>
                        <Link to="/postjob" className="btn btn-primary btn-sm">
                          + Post New Opening
                        </Link>
                      </div>

                      {myPostedJobs.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
                          <p>You haven't posted any job openings yet.</p>
                          <Link to="/postjob" className="btn btn-primary btn-sm">Post Your First Job</Link>
                        </div>
                      ) : (
                        <div className="dashboard-table-wrapper">
                          <table className="dashboard-table">
                            <thead>
                              <tr>
                                <th>Role Title</th>
                                <th>Location</th>
                                <th>Salary Rate</th>
                                <th>Job Type</th>
                                <th>Listed On</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {myPostedJobs.map((job) => (
                                <tr key={job._id}>
                                  <td>
                                    <Link to={`/jobs/${job._id}`} style={{ fontWeight: 600 }}>
                                      {job.title}
                                    </Link>
                                  </td>
                                  <td>{job.location}</td>
                                  <td>${job.salary?.toLocaleString()}/yr</td>
                                  <td>
                                    <span className="tag tag-type">{job.jobType}</span>
                                  </td>
                                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                  <td>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                      <Link to={`/edit-job/${job._id}`} className="btn btn-secondary btn-sm" style={{ padding: "0.3rem 0.6rem" }}>
                                        Edit
                                      </Link>
                                      <button
                                        onClick={() => handleDeleteJob(job._id)}
                                        className="btn btn-danger btn-sm"
                                        style={{ padding: "0.3rem 0.6rem" }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "applications" && (
                    <div>
                      <h2>Received Applications</h2>
                      <p>View resumes, read candidate cover letters, and update candidate selection statuses.</p>

                      {receivedApplications.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>
                          <p>No jobseeker applications have been received yet.</p>
                        </div>
                      ) : (
                        <div className="dashboard-table-wrapper">
                          <table className="dashboard-table">
                            <thead>
                              <tr>
                                <th>Applicant</th>
                                <th>Job Role</th>
                                <th>Submitted</th>
                                <th>Contact Info</th>
                                <th>Resume</th>
                                <th>Select Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {receivedApplications.map((app) => (
                                <tr key={app._id}>
                                  <td>
                                    <strong style={{ display: "block" }}>{app.applicant?.name}</strong>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.applicant?.email}</span>
                                  </td>
                                  <td>
                                    {app.job ? (
                                      <Link to={`/jobs/${app.job._id}`}>{app.job.title}</Link>
                                    ) : (
                                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Deleted Role</span>
                                    )}
                                  </td>
                                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                  <td style={{ maxWidth: "200px" }}>
                                    <span style={{ fontSize: "0.8rem", display: "block", fontStyle: app.applicant?.profile?.bio ? "normal" : "italic" }}>
                                      {app.applicant?.profile?.bio || "No summary provided"}
                                    </span>
                                    {app.applicant?.profile?.contactPhone && (
                                      <span style={{ fontSize: "0.75rem", color: "var(--color-info)", display: "block", marginTop: "0.25rem" }}>
                                        📞 {app.applicant.profile.contactPhone}
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    <a
                                      href={`http://localhost:5000${app.resumeUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                                    >
                                      Download 📥
                                    </a>
                                  </td>
                                  <td>
                                    <select
                                      value={app.status}
                                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", width: "auto" }}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Interview">Interview</option>
                                      <option value="Accepted">Accepted</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ================== ADMIN WORKSPACE ================== */}
              {user.role === "admin" && (
                <>
                  {activeTab === "overview" && adminStats && (
                    <div>
                      <h2>JobPortal Metrics Overview</h2>
                      <p>View global statistics on active postings, seekers, and status conversions.</p>

                      <div className="stats-row">
                        <div className="glass-panel stat-card">
                          <span className="stat-label">Total Jobs Posted</span>
                          <span className="stat-val">{adminStats.totalJobs}</span>
                        </div>
                        <div className="glass-panel stat-card">
                          <span className="stat-label">Total Submissions</span>
                          <span className="stat-val">{adminStats.totalApplications}</span>
                        </div>
                        <div className="glass-panel stat-card">
                          <span className="stat-label">Total Members</span>
                          <span className="stat-val">{adminStats.totalUsers}</span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                        <div className="glass-panel">
                          <h3 style={{ marginBottom: "1rem" }}>Member Breakdown</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Jobseekers:</span>
                              <strong>{adminStats.usersByRole?.jobseeker}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Employers:</span>
                              <strong>{adminStats.usersByRole?.employer}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Administrators:</span>
                              <strong>{adminStats.usersByRole?.admin}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="glass-panel">
                          <h3 style={{ marginBottom: "1rem" }}>Applications by Status</h3>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Pending Review:</span>
                              <strong>{adminStats.applicationsByStatus?.Pending}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Interviews Scheduled:</span>
                              <strong>{adminStats.applicationsByStatus?.Interview}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Accepted:</span>
                              <strong>{adminStats.applicationsByStatus?.Accepted}</strong>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span>Rejected:</span>
                              <strong>{adminStats.applicationsByStatus?.Rejected}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "users" && (
                    <div>
                      <h2>Manage JobPortal Users</h2>
                      <p>View all accounts and delete users (clears their related listings and submissions).</p>

                      <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Account Role</th>
                              <th>Joined On</th>
                              <th>Delete Account</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminUsers.map((u) => (
                              <tr key={u._id}>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td>
                                  <span className="user-badge" style={{ borderColor: u.role === "admin" ? "var(--color-accent)" : "rgba(99,102,241,0.2)" }}>
                                    {u.role}
                                  </span>
                                </td>
                                <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                                <td>
                                  <button
                                    onClick={() => handleAdminDeleteUser(u._id)}
                                    className="btn btn-danger btn-sm"
                                    disabled={u._id === user.id}
                                    style={{ padding: "0.3rem 0.6rem" }}
                                  >
                                    Delete Account
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === "jobs" && (
                    <div>
                      <h2>Manage Posted Jobs</h2>
                      <p>View and moderate all active job openings posted across the platform.</p>

                      <div className="dashboard-table-wrapper">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Job Title</th>
                              <th>Company / Lister</th>
                              <th>Location</th>
                              <th>Salary</th>
                              <th>Delete Post</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminJobs.map((j) => (
                              <tr key={j._id}>
                                <td>
                                  <Link to={`/jobs/${j._id}`} style={{ fontWeight: 600 }}>
                                    {j.title}
                                  </Link>
                                </td>
                                <td>{j.employer?.name || "Unknown"}</td>
                                <td>{j.location}</td>
                                <td>${j.salary?.toLocaleString()}/yr</td>
                                <td>
                                  <button
                                    onClick={() => handleAdminDeleteJob(j._id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: "0.3rem 0.6rem" }}
                                  >
                                    Delete Post
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
