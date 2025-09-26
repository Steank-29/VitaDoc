import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

import Logo from "../assets/logo.png";
import MedicalImage from "../assets/doctor.png";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/Firebase.config"; // Import from firebase.js

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter code, 3: New password
  const [usePhone, setUsePhone] = useState(false);
  const [contact, setContact] = useState(""); // email or phone
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null); // For Firebase phone confirmation
  const recaptchaVerifier = useRef(null);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone);
  const validatePassword = (password) => password.length >= 6;

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  // Initialize reCAPTCHA (invisible) on mount
  useEffect(() => {
    recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible", // Hidden, but required for phone auth
      callback: () => {
        // reCAPTCHA solved - not needed for invisible
      },
    });
  }, []);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedContact = usePhone ? normalizePhoneNumber(contact) : contact.toLowerCase();

    if (usePhone) {
      if (!validatePhone(contact)) {
        toast.error("Please enter a valid phone number");
        setIsLoading(false);
        return;
      }
      // Firebase phone OTP
      try {
        const result = await signInWithPhoneNumber(auth, normalizedContact, recaptchaVerifier.current);
        setConfirmationResult(result);
        toast.success("Code sent to phone!");
        setStep(2);
      } catch (err) {
        console.error('Firebase send OTP error:', err);
        toast.error(err.message.includes('auth/invalid-phone-number') ? "Invalid phone number" : "Error sending code to phone");
      }
    } else {
      if (!validateEmail(contact)) {
        toast.error("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      // Email OTP (unchanged, using backend)
      try {
        const res = await fetch("http://localhost:5000/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: normalizedContact, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Code sent to email!");
          setStep(2);
        } else {
          toast.error(data.message || "Error sending code");
        }
      } catch (err) {
        console.error('Send code error:', err);
        toast.error("Network error, please try again");
      }
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (code.length !== 6) {
      toast.error("Code must be 6 digits");
      setIsLoading(false);
      return;
    }

    if (usePhone) {
      // Firebase phone verification
      try {
        const credential = await confirmationResult.confirm(code);
        const idToken = await credential.user.getIdToken();
        setStep(3); // Proceed to password reset (send idToken to backend in next step)
        toast.success("Phone verified successfully!");
      } catch (err) {
        console.error('Firebase verify OTP error:', err);
        toast.error(err.message.includes('auth/invalid-verification-code') ? "Invalid code" : "Error verifying code");
      }
    } else {
      // Email verification (unchanged)
      try {
        const res = await fetch("http://localhost:5000/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, code, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Code verified successfully!");
          setStep(3);
        } else {
          toast.error(data.message || "Invalid code");
        }
      } catch (err) {
        console.error('Verify code error:', err);
        toast.error("Network error, please try again");
      }
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validatePassword(newPassword)) {
      toast.error("New password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (usePhone) {
      // Firebase: Get current ID token (from verified user)
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('No verified user');
        const idToken = await user.getIdToken();
        const res = await fetch("http://localhost:5000/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, newPassword, type: "phone" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Password reset successfully!");
          navigate("/"); // Back to sign in
        } else {
          toast.error(data.message || "Error resetting password");
        }
      } catch (err) {
        console.error('Firebase reset error:', err);
        toast.error("Error resetting password");
      }
    } else {
      // Email reset (unchanged)
      try {
        const res = await fetch("http://localhost:5000/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, newPassword, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Password reset successfully!");
          navigate("/"); // Back to sign in
        } else {
          toast.error(data.message || "Error resetting password");
        }
      } catch (err) {
        console.error('Reset password error:', err);
        toast.error("Network error, please try again");
      }
    }
    setIsLoading(false);
  };

  const switchToPhone = () => {
    setUsePhone(true);
    setContact("");
  };

  const switchToEmail = () => {
    setUsePhone(false);
    setContact("");
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
          maxHeight: "90vh",
        }}
      >
        <div
          className="d-flex flex-column p-4 p-md-5"
          style={{
            backgroundColor: "#4169E1",
            flex: "0 0 35%",
            display: window.innerWidth < 768 ? "none" : "flex",
          }}
        >
          <div className="mb-2">
            <img
              src={Logo}
              alt="VitaDoc Logo"
              style={{
                width: "clamp(100px, 10vw, 150px)",
                height: "auto",
                aspectRatio: "150/80",
              }}
              className="rounded img-fluid"
            />
          </div>
          <div className="d-flex justify-content-center align-items-center flex-grow-1 my-3">
            <img
              src={MedicalImage}
              alt="Medical Illustration"
              style={{
                width: "100%",
                maxWidth: "380px",
                height: "auto",
                aspectRatio: "380/420",
              }}
              className="img-fluid rounded"
            />
          </div>
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
        <motion.div
          className="d-flex flex-column justify-content-center align-items-center p-3 p-md-4 p-lg-5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: "0 0 65%",
            backgroundColor: "#ffffff",
            minHeight: "500px",
            maxHeight: "90vh",
            overflow: "hidden",
          }}
        >
          <div 
            className="w-100" 
            style={{ 
              maxWidth: "400px",
              maxHeight: "100%",
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>
              {`
                div[style*="overflowY: auto"]::-webkit-scrollbar {
                  display: none;
                }
                .input-group .form-control:focus + .input-group-text {
                  border-color: #4169E1;
                  box-shadow: 0 0 0 0.2rem rgba(65, 105, 225, 0.25);
                }
                .password-strength-indicator {
                  height: 4px;
                  width: 100%;
                  margin-top: 5px;
                  border-radius: 2px;
                }
              `}
            </style>
            <div className="text-end mb-4 d-md-none">
              <img
                src={Logo}
                alt="VitaDoc Logo"
                style={{ width: "60px", height: "60px" }}
                className="rounded img-fluid"
              />
            </div>
            <h2
              className="mb-3 mb-md-4 text-center text-dark fw-bold"
              style={{
                transition: "color 0.3s ease",
                fontFamily: "montserrat",
                fontSize: "clamp(28px, 5vw, 42px)",
              }}
            >
              Reset Password
            </h2>
            <p
              className="text-center text-muted mb-3 mb-md-4"
              style={{
                transition: "color 0.3s ease",
                fontFamily: "montserrat",
                fontSize: "clamp(14px, 2vw, 17px)",
              }}
            >
              {step === 1 && "Enter your email or phone to receive a reset code"}
              {step === 2 && "Enter the code sent to your email or phone"}
              {step === 3 && "Create a new password"}
            </p>
            {/* Hidden reCAPTCHA container for Firebase */}
            <div id="recaptcha-container" style={{ display: "none" }}></div>
            {step === 1 && (
              <form onSubmit={handleSendCode}>
                <div className="mb-3 input-group">
                  <input
                    type={usePhone ? "tel" : "email"}
                    className="form-control"
                    placeholder={usePhone ? "Phone Number (e.g., +1234567890)" : "Email address"}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      borderRadius: "10px 0 0 10px",
                      border: "2px solid #ced4da",
                      padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  <span className="input-group-text" style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}>
                    <i className={usePhone ? "bi bi-telephone" : "bi bi-envelope"}></i>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <span className="small text-muted">
                    or with{" "}
                    <a
                      href="#"
                      className="text-primary fw-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        if (usePhone) switchToEmail();
                        else switchToPhone();
                      }}
                      style={{ fontSize: "clamp(13px, 2vw, 14px)" }}
                    >
                      {usePhone ? "email" : "phone number"}
                    </a>
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#4169E1",
                    borderColor: "#4169E1",
                    borderRadius: "8px",
                    padding: "12px",
                    fontWeight: "600",
                    color: "white",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending Code...
                    </>
                  ) : (
                    "Send Code"
                  )}
                </button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="mb-3 input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    style={{
                      borderRadius: "10px 0 0 10px",
                      border: "2px solid #ced4da",
                      padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  <span className="input-group-text" style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}>
                    <i className="bi bi-shield-check"></i>
                  </span>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#4169E1",
                    borderColor: "#4169E1",
                    borderRadius: "8px",
                    padding: "12px",
                    fontWeight: "600",
                    color: "white",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3 input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      borderRadius: "10px 0 0 10px",
                      border: "2px solid #ced4da",
                      padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                  >
                    <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
                <div className="mb-3 input-group">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      borderRadius: "10px 0 0 10px",
                      border: "2px solid #ced4da",
                      padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  <button
                    type="button"
                    className="input-group-text"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                  >
                    <i className={showConfirmNewPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={isLoading}
                  style={{
                    backgroundColor: "#4169E1",
                    borderColor: "#4169E1",
                    borderRadius: "8px",
                    padding: "12px",
                    fontWeight: "600",
                    color: "white",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
            <div className="text-center mt-3">
              <p className="mb-0 text-muted small">
                <a
                  href="#"
                  className="text-primary fw-semibold"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  style={{ fontSize: "clamp(13px, 2vw, 14px)" }}
                >
                  Back to Sign In
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}