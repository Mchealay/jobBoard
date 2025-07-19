import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Set default auth header for axios if token exists
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_URL}/profile`);
          setUser(res.data);
        } catch (err) {
          console.error("Token verification failed, logging out", err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || "Login failed. Please check credentials." 
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password, role });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem("token", userToken);
      setToken(userToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || "Registration failed. User may already exist." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put(`${API_URL}/profile`, profileData);
      // Reload profile to refresh user state
      const profileRes = await axios.get(`${API_URL}/profile`);
      setUser(profileRes.data);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || "Profile update failed." 
      };
    }
  };

  const toggleSaveJob = async (jobId) => {
    try {
      const res = await axios.post(`${API_URL}/save/${jobId}`);
      // Refresh user to get new savedJobs list
      const profileRes = await axios.get(`${API_URL}/profile`);
      setUser(profileRes.data);
      return { success: true, saved: res.data.saved, message: res.data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || "Failed to toggle save job." 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        toggleSaveJob,
        isAuthenticated: !!token,
        isAdmin: user?.role === "admin",
        isEmployer: user?.role === "employer",
        isJobseeker: user?.role === "jobseeker",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
