import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/Firebase.config";

export default function ForgetPassword() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [usePhone, setUsePhone] = useState(false);
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const recaptchaVerifier = useRef(null);
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

  // Initialize reCAPTCHA (invisible) on mount
  useEffect(() => {
    recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {},
    });
  }, []);

  const languages = [
    { code: "en", flag: FlagEN, label: t("english") },
    { code: "fr", flag: FlagFR, label: t("french") },
    { code: "ar", flag: FlagAR, label: t("arabic") },
  ];

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone);
  const validatePassword = (password) => password.length >= 6;

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s-]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const normalizedContact = usePhone ? normalizePhoneNumber(contact) : contact.toLowerCase();

    if (usePhone) {
      if (!validatePhone(contact)) {
        toast.error(t("validation.invalidPhoneNumber"));
        setIsLoading(false);
        return;
      }
      try {
        const result = await signInWithPhoneNumber(auth, normalizedContact, recaptchaVerifier.current);
        setConfirmationResult(result);
        toast.success(t("validation.codeSentPhone"));
        setStep(2);
      } catch (err) {
        console.error('Firebase send OTP error:', err);
        toast.error(err.message.includes('auth/invalid-phone-number') ? t("validation.invalidPhoneNumber") : t("validation.errorSendingCode"));
      }
    } else {
      if (!validateEmail(contact)) {
        toast.error(t("validation.invalidEmail"));
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact: normalizedContact, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(t("validation.codeSentEmail"));
          setStep(2);
        } else {
          toast.error(data.message || t("validation.errorSendingCode"));
        }
      } catch (err) {
        console.error('Send code error:', err);
        toast.error(t("validation.networkError"));
      }
    }
    setIsLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (code.length !== 6) {
      toast.error(t("validation.invalidCode"));
      setIsLoading(false);
      return;
    }

    if (usePhone) {
      try {
        const credential = await confirmationResult.confirm(code);
        const idToken = await credential.user.getIdToken();
        setStep(3);
        toast.success(t("validation.codeVerified"));
      } catch (err) {
        console.error('Firebase verify OTP error:', err);
        toast.error(err.message.includes('auth/invalid-verification-code') ? t("validation.invalidCode") : t("validation.errorVerifyingCode"));
      }
    } else {
      try {
        const res = await fetch("http://localhost:5000/auth/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, code, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(t("validation.codeVerified"));
          setStep(3);
        } else {
          toast.error(data.message || t("validation.invalidCode"));
        }
      } catch (err) {
        console.error('Verify code error:', err);
        toast.error(t("validation.networkError"));
      }
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validatePassword(newPassword)) {
      toast.error(t("validation.invalidPassword"));
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t("validation.passwordsDontMatch"));
      setIsLoading(false);
      return;
    }

    if (usePhone) {
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
          toast.success(t("validation.passwordResetSuccess"));
          navigate("/");
        } else {
          toast.error(data.message || t("validation.errorResettingPassword"));
        }
      } catch (err) {
        console.error('Firebase reset error:', err);
        toast.error(t("validation.errorResettingPassword"));
      }
    } else {
      try {
        const res = await fetch("http://localhost:5000/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contact, newPassword, type: "email" }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(t("validation.passwordResetSuccess"));
          navigate("/");
        } else {
          toast.error(data.message || t("validation.errorResettingPassword"));
        }
      } catch (err) {
        console.error('Reset password error:', err);
        toast.error(t("validation.networkError"));
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
              {t("resetPassword")}
            </h2>
            <p
              className="text-center text-muted mb-3 mb-md-4"
              style={{
                transition: "color 0.3s ease",
                fontFamily: "montserrat",
                fontSize: "clamp(14px, 2vw, 17px)",
              }}
            >
              {step === 1 && t("enterContactPrompt")}
              {step === 2 && t("enterCodePrompt")}
              {step === 3 && t("createNewPasswordPrompt")}
            </p>
            <div id="recaptcha-container" style={{ display: "none" }}></div>
            {step === 1 && (
              <form onSubmit={handleSendCode}>
                <div className="mb-3 input-group">
                  <input
                    type={usePhone ? "tel" : "email"}
                    className="form-control"
                    placeholder={usePhone ? t("phoneNumber") : t("email")}
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
                  <span
                    className="input-group-text"
                    style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                  >
                    <i className={usePhone ? "bi bi-telephone" : "bi bi-envelope"}></i>
                  </span>
                </div>
                <div className="text-center mb-3">
                  <span className="small text-muted">
                    {t("orWith")}{" "}
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
                      {usePhone ? t("email") : t("phoneNumber")}
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
                      {t("sendingCode")}
                    </>
                  ) : (
                    t("sendCode")
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
                    placeholder={t("enterCode")}
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
                  <span
                    className="input-group-text"
                    style={{ borderRadius: "0 10px 10px 0", border: "2px solid #ced4da", borderLeft: "none" }}
                  >
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
                      {t("verifying")}
                    </>
                  ) : (
                    t("verifyCode")
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
                    placeholder={t("newPassword")}
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
                    placeholder={t("confirmNewPassword")}
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
                      {t("resettingPassword")}
                    </>
                  ) : (
                    t("resetPassword")
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
                  {t("backToSignIn")}
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}