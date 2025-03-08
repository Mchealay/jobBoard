import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated, setUserRole }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token); // Save token to localStorage
      setIsAuthenticated(true); // Update authentication state

      // Decode the token to get the user role
      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      setUserRole(payload.user.role);

      // Redirect based on role
      if (payload.user.role === "employer") {
        navigate("/post-job"); // Redirect to Post Job page for employers
      } else {
        navigate("/"); // Redirect to home page for job seekers
      }
    } catch (err) {
      console.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;