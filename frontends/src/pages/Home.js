import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import JobCard from "../components/JobCard";
import SearchFilters from "../components/SearchFilters";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, toggleSaveJob } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search parameters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    location: "",
    jobType: "",
    experienceLevel: "",
    minSalary: "",
    maxSalary: ""
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  const fetchJobs = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pageNumber);
      queryParams.append("limit", 6);

      // Map filters to query params
      if (filters.keyword) queryParams.append("keyword", filters.keyword);
      else if (searchKeyword) queryParams.append("keyword", searchKeyword); // top bar search

      if (filters.location) queryParams.append("location", filters.location);
      if (filters.jobType) queryParams.append("jobType", filters.jobType);
      if (filters.experienceLevel) queryParams.append("experienceLevel", filters.experienceLevel);
      if (filters.minSalary) queryParams.append("minSalary", filters.minSalary);
      if (filters.maxSalary) queryParams.append("maxSalary", filters.maxSalary);

      const res = await axios.get(`http://localhost:5000/api/jobs/search?${queryParams.toString()}`);
      setJobs(res.data.jobs);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      setTotalJobsCount(res.data.totalJobs || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters, searchKeyword]);

  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: searchKeyword }));
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchJobs(1);
  };

  const handleClearFilters = () => {
    setSearchKeyword("");
    setFilters({
      keyword: "",
      location: "",
      jobType: "",
      experienceLevel: "",
      minSalary: "",
      maxSalary: ""
    });
    setCurrentPage(1);
  };

  const handleSaveToggle = async (jobId) => {
    if (!toggleSaveJob) return;
    await toggleSaveJob(jobId);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchJobs(page);
  };

  return (
    <div className="main-content">
      {/* Hero Search Section */}
      <div style={{ textAlign: "center", marginBottom: "3rem", marginTop: "1rem" }}>
        <h1 style={{ fontSize: "2.8rem", marginBottom: "1rem" }}>
          Find Your <span style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dream Job</span> Today
        </h1>
        <p style={{ fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
          Discover thousands of career opportunities from leading tech companies and start-ups.
        </p>

        <form onSubmit={handleSearchSubmit} className="search-bar-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Job Title or Keywords..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ borderRadius: "var(--border-radius-sm) 0 0 var(--border-radius-sm)", borderRight: "none" }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: "0 var(--border-radius-sm) var(--border-radius-sm) 0", whiteSpace: "nowrap" }}>
            Search Jobs
          </button>
        </form>
      </div>

      {/* Main Home Layout */}
      <div className="home-layout">
        {/* Filters Sidebar */}
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {/* Jobs Feed */}
        <div className="jobs-feed-wrapper">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: "1.4rem" }}>
              {loading ? "Searching openings..." : `${totalJobsCount} Jobs Available`}
            </h2>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="spinner"></div>
          ) : jobs.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <span style={{ fontSize: "3rem" }}>🔍</span>
              <h3 style={{ marginTop: "1.5rem" }}>No Jobs Found</h3>
              <p>We couldn't find any job openings matching your exact filters. Try broadening your criteria!</p>
              <button onClick={handleClearFilters} className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
                Reset Search
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                {jobs.map((job) => {
                  const isSaved = user?.savedJobs?.includes(job._id) || false;
                  return (
                    <JobCard
                      key={job._id}
                      job={job}
                      isSaved={isSaved}
                      onSaveToggle={handleSaveToggle}
                    />
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &laquo;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;