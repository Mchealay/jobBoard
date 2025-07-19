import React from "react";

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-logo">💼 JobPortal</div>
        <p className="footer-text">
          Connecting talent with opportunity worldwide. Built for seekers, employers, and administrators.
        </p>
        <p className="footer-text" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
          &copy; {new Date().getFullYear()} JobPortal Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;