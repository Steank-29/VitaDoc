import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

// Import images from assets folder
import Logo from "../assets/logo.png"; // Adjust path based on your folder structure
import MedicalImage from "../assets/doctor.png"; // Adjust path based on your folder structure

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Example submit handler
  const handleSignIn = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Signed in successfully!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    toast.success("Redirecting to Google Sign In...");
    // Handle Google OAuth here
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <motion.div
        className="auth-wrapper d-flex flex-column flex-md-row position-relative bg-white shadow-lg rounded-4 overflow-hidden mx-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: "1200px",
          minHeight: "500px",
        }}
      >
        {/* Left Panel - Brand Section */}
        <div
          className="d-flex flex-column p-4 p-md-5"
          style={{ 
            backgroundColor: "#4169E1", 
            flex: "0 0 35%",
            display: window.innerWidth < 768 ? 'none' : 'flex'
          }}
        >
          {/* Logo */}
          <div className="mb-2">
            <img
              src={Logo}
              alt="VitaDoc Logo"
              style={{ 
                width: "clamp(100px, 10vw, 150px)", 
                height: "auto",
                aspectRatio: "150/80"
              }}
              className="rounded img-fluid"
            />
          </div>

          {/* Center Image - Adjusted positioning */}
          <div className="d-flex justify-content-center align-items-center flex-grow-1 my-3">
            <img
              src={MedicalImage}
              alt="Medical Illustration"
              style={{
                width: "100%",
                maxWidth: "380px",
                height: "auto",
                aspectRatio: "380/420"
              }}
              className="img-fluid rounded"
            />
          </div>

          {/* Copyright */}
          <div className="text-center mt-auto">
            <p
              className="mb-0 small"
              style={{
                color: "#e3f2fd",
                fontSize: "clamp(10px, 1.2vw, 12px)",
                letterSpacing: "1px",
                fontWeight: "300",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#d0e7ff")}
              onMouseLeave={(e) => (e.target.style.color = "#e3f2fd")}
            >
              <i className="bi bi-copyright me-1"></i>
              2026, VitaDoc. All rights reserved
            </p>
          </div>
        </div>

        {/* Right Panel - Sign In Form */}
        <motion.div
          className="d-flex flex-column justify-content-center align-items-center p-3 p-md-4 p-lg-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: "0 0 65%",
            backgroundColor: "#ffffff",
            minHeight: "500px"
          }}
        >
          <div className="w-100" style={{ maxWidth: "400px" }}>
            {/* Logo in top right - visible on mobile */}
            <div className="text-end mb-4 d-md-none">
              <img
                src={Logo}
                alt="VitaDoc Logo"
                style={{ 
                  width: "60px", 
                  height: "60px" 
                }}
                className="rounded img-fluid"
              />
            </div>

            {/* Welcome Text */}
            <h2
              className="mb-3 mb-md-4 text-center text-dark fw-bold"
              style={{ 
                transition: "color 0.3s ease", 
                fontFamily: "montserrat", 
                fontSize: "clamp(28px, 5vw, 42px)" 
              }}
            >
              Doctor Connect
            </h2>
            <p
              className="text-center text-muted mb-3 mb-md-4"
              style={{ 
                transition: "color 0.3s ease",
                fontFamily: "montserrat", 
                fontSize: "clamp(14px, 2vw, 17px)" 
              }}
            >
              Sign in to your account to continue
            </p>

            {/* Sign In Form */}
            <form onSubmit={handleSignIn}>
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email address"
                  required
                  disabled={isLoading}
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #ced4da",
                    padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                />
              </div>
              <div className="mb-3 mb-md-4">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  required
                  disabled={isLoading}
                  style={{
                    borderRadius: "10px",
                    border: "2px solid #ced4da",
                    padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                  }}
                />
              </div>

              <div className="mb-3 mb-md-4">
                <a
                  href="#"
                  className="small text-decoration-none text-muted"
                  style={{ 
                    fontSize: "clamp(13px, 2vw, 15px)", 
                    transition: "color 0.3s ease", 
                    fontFamily: "montserrat" 
                  }}
                >
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 mb-3 mb-md-4"
                disabled={isLoading}
                style={{
                  backgroundColor: "#4169E1",
                  borderColor: "#4169E1",
                  borderRadius: "8px",
                  padding: "12px",
                  fontWeight: "600",
                  color: "white",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
              <span className="px-3 text-muted small">or</span>
              <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
            </div>

            {/* Google Sign In Button */}
            <button
              className="btn w-100 d-flex align-items-center justify-content-center mb-3"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #4285f4",
                borderRadius: "8px",
                padding: "12px 24px",
                fontWeight: "500",
                color: "#4285f4",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "clamp(13px, 2vw, 14px)",
                height: "44px",
                transition: "background-color 0.3s ease, color 0.3s ease",
                opacity: isLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = "#4285f4";
                  e.target.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = "#ffffff";
                  e.target.style.color = "#4285f4";
                }
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 48 48"
                className="me-2"
                style={{ flexShrink: 0 }}
              >
                <path
                  fill="#4285F4"
                  d="M45.1 24c0-1.2-.1-2.3-.3-3.5H24v6.8h9.7c-0.4 2.1-1.6 3.9-3.4 5.1l5.5 4.3c3.2-3 5.1-7.4 5.1-12.3z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c7.1 0 13.1-2.3 17.5-6.3L34.1 37c-1.8 1.2-4.1 1.9-6.6 1.9-5.1 0-9.4-3.4-11-8H9v5.5c2.5 4.8 7.7 8.1 13.9 8.1z"
                />
                <path
                  fill="#FBBC05"
                  d="M9 26v5.6H9c0-5.1 1.7-9.9 4.8-13.9L9.5 11C6.3 14.8 4 19.4 4 24.6c0 1.2.1 2.3.3 3.4L9 26z"
                />
                <path
                  fill="#EA4335"
                  d="M24 9.2c2.8 0 5.3 1 7.3 2.8l5.4-5.3C34.2 2.8 29.8 1 24 1s-10.2 1.8-13.8 5.2L15.6 11c2.2-2 5-3.8 8.4-3.8z"
                />
              </svg>
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-3">
              <p className="mb-0 text-muted small">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="text-primary fw-semibold"
                  style={{ 
                    fontSize: "clamp(13px, 2vw, 14px)", 
                    transition: "color 0.3s ease" 
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#1e50a2")}
                  onMouseLeave={(e) => (e.target.style.color = "#4169E1")}
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}