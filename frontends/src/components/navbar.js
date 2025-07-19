import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span style={{ color: "var(--color-primary)" }}>💼</span> JobPortal
        </Link>
        
        <nav className="navbar-links">
          <Link to="/" className={`navbar-link ${isActive("/") ? "active" : ""}`}>
            Explore Jobs
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className={`navbar-link ${isActive("/login") ? "active" : ""}`}>
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user?.role === "employer" && (
                <>
                  <Link to="/postjob" className={`navbar-link ${isActive("/postjob") ? "active" : ""}`}>
                    Post Job
                  </Link>
                  <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
                    Employer Panel
                  </Link>
                </>
              )}

              {user?.role === "jobseeker" && (
                <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
                  My Dashboard
                </Link>
              )}

              {user?.role === "admin" && (
                <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
                  Admin Panel
                </Link>
              )}

              <div className="navbar-user-info">
                <span className="user-badge">{user?.role}</span>
                <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: "500" }}>
                  {user?.name}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;