import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import JobDetails from "./pages/jobDetails";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import PostJob from "./components/postJob";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // Decode the token to get the user role
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.user.role);
    }
  }, []);

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} userRole={userRole} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUp setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />}
        />
        <Route
          path="/post-job"
          element={isAuthenticated && userRole === "employer" ? <PostJob /> : <Navigate to="/login" />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
