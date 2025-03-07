import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isAuthenticated, userRole }) => {
    return (
      <nav>
        <Link to="/">Home</Link>
        {isAuthenticated && userRole === "employer" && (
          <Link to="/post-job">Post Job</Link>
        )}
        {!isAuthenticated && <Link to="/login">Login</Link>}
        {!isAuthenticated && <Link to="/signup">Sign Up</Link>}
      </nav>
    );
  };

export default Navbar;