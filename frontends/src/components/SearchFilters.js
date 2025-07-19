import React from "react";

const SearchFilters = ({ filters, setFilters, onApply, onClear }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
  };

  return (
    <div className="glass-panel filters-wrapper">
      <h3 style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Filter Jobs</span>
        <button 
          onClick={onClear} 
          style={{ 
            background: "none", 
            border: "none", 
            color: "var(--color-primary)", 
            fontSize: "0.8rem", 
            cursor: "pointer", 
            fontWeight: "600" 
          }}
        >
          Clear All
        </button>
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label htmlFor="keyword">Keyword</label>
          <input
            id="keyword"
            type="text"
            name="keyword"
            className="form-control"
            placeholder="Title, description..."
            value={filters.keyword}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            className="form-control"
            placeholder="e.g. San Francisco, Remote"
            value={filters.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobType">Job Type</label>
          <select
            id="jobType"
            name="jobType"
            value={filters.jobType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
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
            value={filters.experienceLevel}
            onChange={handleChange}
          >
            <option value="">All Levels</option>
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Level</option>
          </select>
        </div>

        <div className="form-group">
          <label>Salary Range ($/yr)</label>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="number"
              name="minSalary"
              className="form-control"
              placeholder="Min"
              value={filters.minSalary}
              onChange={handleChange}
            />
            <span style={{ color: "var(--text-muted)" }}>-</span>
            <input
              type="number"
              name="maxSalary"
              className="form-control"
              placeholder="Max"
              value={filters.maxSalary}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%" }}>
          Apply Filters
        </button>
      </form>
    </div>
  );
};

export default SearchFilters;
