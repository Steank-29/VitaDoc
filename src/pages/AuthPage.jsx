import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { useTranslation } from "react-i18next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

import Logo from "../assets/logo.png";
import MedicalImage from "../assets/doctor.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
import FlagAR from "../assets/flag-ar.png";

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility
  const dateInputRef = useRef(null);
  const genderSelectRef = useRef(null);
  const specialtySelectRef = useRef(null);
  const vantaRef = useRef(null);

  // Set English as the default language on mount
  useEffect(() => {
    i18n.changeLanguage("en");
  }, [i18n]);

  // Initialize Vanta effect
  useEffect(() => {
    const vantaEffect = NET({
      el: vantaRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x4169e1,
      backgroundColor: 0xf8f9fa,
      points: 10.0,
      maxDistance: 20.0,
      spacing: 15.0,
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // Handle Google OAuth token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      toast.success(t("validation.googleSignInSuccess"));
      navigate("/dashboard", { replace: true });
    }
  }, [location, navigate, t]);

  const languages = [
    { code: "en", flag: FlagEN, label: t("english") },
    { code: "fr", flag: FlagFR, label: t("french") },
    { code: "ar", flag: FlagAR, label: t("arabic") },
  ];

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validatePhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone);
  const validateName = (name) => name.length >= 2;

  const getPasswordStrength = (password) => {
    if (!password) return { strength: "none", color: "transparent" };
    if (password.length < 6) return { strength: "weak", color: "#dc3545" };
    if (password.length < 10) return { strength: "medium", color: "#ffc107" };
    return { strength: "strong", color: "#28a745" };
  };

  const getConfirmPasswordIconColor = () => {
    if (!confirmPassword) return "#6c757d";
    return password === confirmPassword ? "#28a745" : "#dc3545";
  };

  const medicalSpecialties = Object.keys(t("medicalSpecialties", { returnObjects: true })).map((key) => ({
    key,
    label: t(`medicalSpecialties.${key}`),
  }));

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, "");
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!validateEmail(email)) {
      toast.error(t("validation.invalidEmail"));
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      toast.error(t("validation.invalidPassword"));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success(t("validation.signInSuccess"));
        navigate("/dashboard");
      } else {
        toast.error(data.message || t("validation.signInError"));
      }
    } catch (err) {
      console.error("Signin error:", err);
      toast.error(t("validation.networkError"));
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const gender = formData.get("gender");
    const dateOfBirth = formData.get("dateOfBirth");
    const medicalSpecialty = formData.get("medicalSpecialty");
    const picture = formData.get("picture");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const location = formData.get("location");
    const phoneNumber = formData.get("phoneNumber");
    const secondPhoneNumber = formData.get("secondPhoneNumber");

    if (!validateName(firstName)) {
      toast.error(t("validation.invalidFirstName"));
      setIsLoading(false);
      return;
    }
    if (!validateName(lastName)) {
      toast.error(t("validation.invalidLastName"));
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      toast.error(t("validation.invalidEmail"));
      setIsLoading(false);
      return;
    }
    if (!gender || !["male", "female", "other"].includes(gender)) {
      toast.error(t("validation.invalidGender"));
      setIsLoading(false);
      return;
    }
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
      toast.error(t("validation.invalidDateOfBirth"));
      setIsLoading(false);
      return;
    }
    if (!medicalSpecialty || !medicalSpecialties.some((spec) => spec.key === medicalSpecialty)) {
      toast.error(t("validation.invalidMedicalSpecialty"));
      setIsLoading(false);
      return;
    }
    if (!picture || picture.size === 0) {
      toast.error(t("validation.invalidPicture"));
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      toast.error(t("validation.invalidPassword"));
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("validation.passwordsDontMatch"));
      setIsLoading(false);
      return;
    }
    if (!location) {
      toast.error(t("validation.invalidLocation"));
      setIsLoading(false);
      return;
    }
    if (!validatePhone(phoneNumber)) {
      toast.error(t("validation.invalidPhoneNumber"));
      setIsLoading(false);
      return;
    }
    if (secondPhoneNumber && !validatePhone(secondPhoneNumber)) {
      toast.error(t("validation.invalidSecondPhoneNumber"));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        toast.success(t("validation.signUpSuccess"));
        navigate("/dashboard");
      } else {
        toast.error(data.message || t("validation.signUpError"));
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(t("validation.networkError"));
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    window.location.href = "/forgetpassword";
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsDropdownOpen(false);
  };

  return (
    <div
      ref={vantaRef}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Flag-based Language Switcher */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: i18n.language === "ar" ? "auto" : "20px",
          left: i18n.language === "ar" ? "20px" : "auto",
          zIndex: 3,
        }}
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
          aria-label={t(`language.${i18n.language}`)}
        >
          <img
            src={languages.find(lang => lang.code === i18n.language)?.flag}
            alt={t(`language.${i18n.language}`)}
            style={{ width: "24px", height: "24px" }}
          />
        </button>
        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: i18n.language === "ar" ? "auto" : 0,
              right: i18n.language === "ar" ? 0 : "auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "8px",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
            }}
          >
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
                aria-label={lang.label}
              >
                <img
                  src={lang.flag}
                  alt={lang.label}
                  style={{ width: "24px", height: "24px" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

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
          zIndex: 2,
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
              alt={t("title")}
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
              alt={t("medicalIllustration")}
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
              {t("copyright")}
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
                .input-group .form-control:focus + .input-group-text,
                .input-group .form-select:focus + .input-group-text {
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
                alt={t("title")}
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
              {t("title")}
            </h2>
            <p
              className="text-center text-muted mb-3 mb-md-4"
              style={{
                transition: "color 0.3s ease",
                fontFamily: "montserrat",
                fontSize: "clamp(14px, 2vw, 17px)",
              }}
            >
              {isSignUp ? t("signUpPrompt") : t("signInPrompt")}
            </p>
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              {isSignUp && (
                <>
                  <div className="mb-3 input-group">
                    <input
                      type="text"
                      name="firstName"
                      className="form-control"
                      placeholder={t("firstName")}
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-person"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <input
                      type="text"
                      name="lastName"
                      className="form-control"
                      placeholder={t("lastName")}
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-person"></i>
                    </span>
                  </div>
                </>
              )}
              <div className="mb-3 input-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder={t("email")}
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
                <span
                  className="input-group-text"
                  style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                >
                  <i className="bi bi-envelope"></i>
                </span>
              </div>
              {isSignUp && (
                <>
                  <div className="mb-3 input-group">
                    <select
                      name="gender"
                      className="form-control"
                      required
                      disabled={isLoading}
                      ref={genderSelectRef}
                      style={{
                        borderRadius: "10px 0 0 10px",
                        border: "2px solid #ced4da",
                        padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <option value="" disabled selected>
                        {t("gender")}
                      </option>
                      <option value="male">{t("male")}</option>
                      <option value="female">{t("female")}</option>
                      <option value="other">{t("other")}</option>
                    </select>
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none", cursor: "pointer" }}
                      onClick={() => genderSelectRef.current.focus()}
                    >
                      <i className="bi bi-gender-ambiguous"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control"
                      required
                      disabled={isLoading}
                      ref={dateInputRef}
                      style={{
                        borderRadius: "10px 0 0 10px",
                        border: "2px solid #ced4da",
                        padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      }}
                    />
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none", cursor: "pointer" }}
                      onClick={() => dateInputRef.current.showPicker()}
                    >
                      <i className="bi bi-calendar"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <select
                      name="medicalSpecialty"
                      className="form-control"
                      required
                      disabled={isLoading}
                      ref={specialtySelectRef}
                      style={{
                        borderRadius: "10px 0 0 10px",
                        border: "2px solid #ced4da",
                        padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                      }}
                    >
                      <option value="" disabled selected>
                        {t("medicalSpecialty")}
                      </option>
                      {medicalSpecialties.map(({ key, label }) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none", cursor: "pointer" }}
                      onClick={() => specialtySelectRef.current.focus()}
                    >
                      <i className="bi bi-heart-pulse"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <input
                      type="file"
                      name="picture"
                      className="form-control"
                      accept="image/*"
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-image"></i>
                    </span>
                  </div>
                </>
              )}
              <div className="mb-3 input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-control"
                  placeholder={t("password")}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                >
                  <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                </button>
              </div>
              {isSignUp && password && (
                <div className="mb-3">
                  <div
                    className="password-strength-indicator"
                    style={{ backgroundColor: getPasswordStrength(password).color }}
                  ></div>
                </div>
              )}
              {isSignUp && (
                <div className="mb-3 input-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder={t("confirmPassword")}
                    required
                    disabled={isLoading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      borderRadius: "10px 0 0 10px",
                      border: "2px solid #ced4da",
                      padding: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                      fontSize: "clamp(14px, 2vw, 16px)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    }}
                  />
                  <span
                    className="input-group-text"
                    style={{
                      borderRadius: "0 10px 10px 0",
                      border: "2px solid #ced4da",
                      borderLeft: "none",
                      color: getConfirmPasswordIconColor(),
                    }}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                </div>
              )}
              {isSignUp && (
                <>
                  <div className="mb-3 input-group">
                    <input
                      type="text"
                      name="location"
                      className="form-control"
                      placeholder={t("location")}
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-geo-alt"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      placeholder={t("phoneNumber")}
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-telephone"></i>
                    </span>
                  </div>
                  <div className="mb-3 input-group">
                    <input
                      type="tel"
                      name="secondPhoneNumber"
                      className="form-control"
                      placeholder={t("secondPhoneNumber")}
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
                    <span
                      className="input-group-text"
                      style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                    >
                      <i className="bi bi-telephone"></i>
                    </span>
                  </div>
                </>
              )}
              {!isSignUp && (
                <div className="mb-3 mb-md-4">
                  <a
                    className="small text-decoration-none text-muted"
                    style={{
                      fontSize: "clamp(13px, 2vw, 15px)",
                      transition: "color 0.3s ease",
                      fontFamily: "montserrat",
                      cursor: "pointer",
                      color: "#6c757d",
                    }}
                    onClick={handleForgotPassword}
                  >
                    {t("forgotPassword")}
                  </a>
                </div>
              )}
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
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isSignUp ? t("signingUp") : t("signingIn")}
                  </>
                ) : isSignUp ? (
                  t("signUp")
                ) : (
                  t("signIn")
                )}
              </button>
            </form>
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
              <span className="px-3 text-muted small">{t("orWith")}</span>
              <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
            </div>
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
                opacity: isLoading ? 0.7 : 1,
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
              <svg width="18" height="18" viewBox="0 0 48 48" className="me-2" style={{ flexShrink: 0 }}>
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
              {t("signInWithGoogle")}
            </button>
            <div className="text-center mt-3">
              <p className="mb-0 text-muted small">
                {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}{" "}
                <a
                  href="#"
                  className="text-primary fw-semibold"
                  style={{
                    fontSize: "clamp(13px, 2vw, 14px)",
                    transition: "color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#1e50a2")}
                  onMouseLeave={(e) => (e.target.style.color = "#4169E1")}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsSignUp(!isSignUp);
                  }}
                >
                  {isSignUp ? t("signInHere") : t("signUpHere")}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}