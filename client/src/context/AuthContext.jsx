import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE = "http://localhost:5000/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("amazeon_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("amazeon_token") || null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("amazeon_token", token);
    } else {
      localStorage.removeItem("amazeon_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("amazeon_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("amazeon_user");
    }
  }, [user]);

  // Login handler (email + password)
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, role: res.data.user.role };
      }
      return { success: false, message: res.data.message || "Login failed" };
    } catch (error) {
      const msg = error.response?.data?.message || "Server connection failed during login.";
      return { success: false, message: msg };
    }
  };

  // Direct login with pre-authenticated user data (used by OAuth callback)
  const loginWithUserData = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
  };

  // Signup/Register handler
  const signup = async (name, email, password, role = "buyer") => {
    try {
      const res = await axios.post(`${API_BASE}/signup`, { name, email, password, role });
      if (res.data.success) {
        return { success: true };
      }
      return { success: false, message: res.data.message || "Registration failed" };
    } catch (error) {
      const msg = error.response?.data?.message || "Server connection failed during registration.";
      return { success: false, message: msg };
    }
  };

  // Social Login handler
  const socialLogin = async (name, email, provider, providerId, role = "buyer") => {
    try {
      const res = await axios.post(`${API_BASE}/social-login`, { name, email, provider, providerId, role });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || "Social login failed" };
    } catch (error) {
      const msg = error.response?.data?.message || "Server connection failed during social login.";
      return { success: false, message: msg };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("amazeon_token");
    localStorage.removeItem("amazeon_user");
    // Also clear legacy non-scoped keys (pre-migration)
    localStorage.removeItem("amazeon_cart");
    localStorage.removeItem("amazeon_orders");
    localStorage.removeItem("amazeon_coupon");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithUserData,
        signup,
        socialLogin,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
