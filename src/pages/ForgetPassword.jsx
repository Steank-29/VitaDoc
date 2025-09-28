import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { useTranslation } from "react-i18next";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/Firebase.config";
import Logo from "../assets/logo.png";
import MedicalImage from "../assets/doctor.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
import FlagAR from "../assets/flag-ar.png";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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
  const [anchorEl, setAnchorEl] = useState(null);
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
    const cleaned = phone.replace(/[\s-]/g, "");
    return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
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
        console.error("Firebase send OTP error:", err);
        toast.error(
          err.message.includes("auth/invalid-phone-number")
            ? t("validation.invalidPhoneNumber")
            : t("validation.errorSendingCode")
        );
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
        console.error("Send code error:", err);
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
        await credential.user.getIdToken();
        setStep(3);
        toast.success(t("validation.codeVerified"));
      } catch (err) {
        console.error("Firebase verify OTP error:", err);
        toast.error(
          err.message.includes("auth/invalid-verification-code")
            ? t("validation.invalidCode")
            : t("validation.errorVerifyingCode")
        );
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
        console.error("Verify code error:", err);
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
        if (!user) throw new Error("No verified user");
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
        console.error("Firebase reset error:", err);
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
        console.error("Reset password error:", err);
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

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleMenuClose();
  };

  return (
    <Box
      ref={vantaRef}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Language Switcher */}
      <Box
        sx={{
          position: "absolute",
          top: "20px",
          right: i18n.language === "ar" ? "auto" : "20px",
          left: i18n.language === "ar" ? "20px" : "auto",
          zIndex: 3,
        }}
      >
        <IconButton
          onClick={handleMenuOpen}
          aria-label={t(`language.${i18n.language}`)}
          sx={{ p: 0 }}
        >
          <img
            src={languages.find((lang) => lang.code === i18n.language)?.flag}
            alt={t(`language.${i18n.language}`)}
            style={{ width: 24, height: 24 }}
          />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            "& .MuiPaper-root": {
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              p: 1,
            },
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: i18n.language === "ar" ? "right" : "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: i18n.language === "ar" ? "right" : "left",
          }}
        >
          {languages.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              sx={{ p: 0 }}
            >
              <IconButton aria-label={lang.label}>
                <img src={lang.flag} alt={lang.label} style={{ width: 24, height: 24 }} />
              </IconButton>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ width: "100%", maxWidth: 1200, minHeight: 500, maxHeight: "90vh", zIndex: 2 }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              bgcolor: "#4169E1",
              flex: { md: "0 0 35%" },
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              p: { md: 5, xs: 4 },
            }}
          >
            <Box sx={{ mb: 2 }}>
              <img
                src={Logo}
                alt={t("title")}
                style={{
                  width: "clamp(100px, 10vw, 150px)",
                  height: "auto",
                  aspectRatio: "150/80",
                  borderRadius: 4,
                }}
              />
            </Box>
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", my: 3 }}>
              <img
                src={MedicalImage}
                alt={t("medicalIllustration")}
                style={{
                  width: "100%",
                  maxWidth: 380,
                  height: "auto",
                  aspectRatio: "380/420",
                  borderRadius: 4,
                }}
              />
            </Box>
            <Box sx={{ textAlign: "center", mt: "auto" }}>
              <Typography
                sx={{
                  color: "#e3f2fd",
                  fontSize: "clamp(10px, 1.2vw, 12px)",
                  letterSpacing: "1px",
                  fontWeight: 300,
                  transition: "color 0.3s ease",
                  "&:hover": { color: "#d0e7ff" },
                }}
              >
                <i className="bi bi-copyright" style={{ marginRight: 4 }} />
                {t("copyright")}
              </Typography>
            </Box>
          </Box>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              flex: "0 0 65%",
              bgcolor: "white",
              minHeight: 500,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: { xs: 3, md: 4, lg: 5 },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                maxHeight: "100%",
                overflowY: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <style>
                {`
                  .password-strength-indicator {
                    height: 4px;
                    width: 100%;
                    margin-top: 5px;
                    border-radius: 2px;
                  }
                `}
              </style>
              <Box sx={{ textAlign: "end", mb: 4, display: { md: "none" } }}>
                <img
                  src={Logo}
                  alt={t("title")}
                  style={{ width: 60, height: 60, borderRadius: 4 }}
                />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  mb: { xs: 3, md: 4 },
                  textAlign: "center",
                  color: "black",
                  fontWeight: 700,
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(28px, 5vw, 42px)",
                  transition: "color 0.3s ease",
                }}
              >
                {t("resetPassword")}
              </Typography>
              <Typography
                sx={{
                  textAlign: "center",
                  color: "text.secondary",
                  mb: { xs: 3, md: 4 },
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: "clamp(14px, 2vw, 17px)",
                  transition: "color 0.3s ease",
                }}
              >
                {step === 1 && t("enterContactPrompt")}
                {step === 2 && t("enterCodePrompt")}
                {step === 3 && t("createNewPasswordPrompt")}
              </Typography>
              <Box id="recaptcha-container" sx={{ display: "none" }} />
              {step === 1 && (
                <form onSubmit={handleSendCode}>
                  <TextField
                    fullWidth
                    type={usePhone ? "tel" : "email"}
                    placeholder={usePhone ? t("phoneNumber") : t("email")}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "2px solid #ced4da",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        "&:hover fieldset": { borderColor: "#4169E1" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4169E1",
                          boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <i className={usePhone ? "bi bi-telephone" : "bi bi-envelope"} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("orWith")}{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (usePhone) switchToEmail();
                          else switchToPhone();
                        }}
                        style={{
                          color: "#4169E1",
                          fontWeight: 600,
                          fontSize: "clamp(13px, 2vw, 14px)",
                          textDecoration: "none",
                        }}
                      >
                        {usePhone ? t("email") : t("phoneNumber")}
                      </a>
                    </Typography>
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      bgcolor: "#4169E1",
                      borderRadius: "8px",
                      p: "12px",
                      fontWeight: 600,
                      color: "white",
                      opacity: isLoading ? 0.7 : 1,
                      mb: 3,
                      "&:hover": { bgcolor: "#3658C1" },
                    }}
                    startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                  >
                    {isLoading ? t("sendingCode") : t("sendCode")}
                  </Button>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleVerifyCode}>
                  <TextField
                    fullWidth
                    type="text"
                    placeholder={t("Enter Code")}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    inputProps={{ maxLength: 6 }}
                    required
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "2px solid #ced4da",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        "&:hover fieldset": { borderColor: "#4169E1" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4169E1",
                          boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <i className="bi bi-shield-check" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      bgcolor: "#4169E1",
                      borderRadius: "8px",
                      p: "12px",
                      fontWeight: 600,
                      color: "white",
                      opacity: isLoading ? 0.7 : 1,
                      mb: 3,
                      "&:hover": { bgcolor: "#3658C1" },
                    }}
                    startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                  >
                    {isLoading ? t("verifying") : t("verifyCode")}
                  </Button>
                </form>
              )}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? "text" : "password"}
                    placeholder={t("newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "2px solid #ced4da",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        "&:hover fieldset": { borderColor: "#4169E1" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4169E1",
                          boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge="end"
                          >
                            <i className={showNewPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type={showConfirmNewPassword ? "text" : "password"}
                    placeholder={t("confirmNewPassword")}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        border: "2px solid #ced4da",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        "&:hover fieldset": { borderColor: "#4169E1" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4169E1",
                          boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                        fontSize: "clamp(14px, 2vw, 16px)",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            edge="end"
                          >
                            <i className={showConfirmNewPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isLoading}
                    sx={{
                      bgcolor: "#4169E1",
                      borderRadius: "8px",
                      p: "12px",
                      fontWeight: 600,
                      color: "white",
                      opacity: isLoading ? 0.7 : 1,
                      mb: 3,
                      "&:hover": { bgcolor: "#3658C1" },
                    }}
                    startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                  >
                    {isLoading ? t("resettingPassword") : t("resetPassword")}
                  </Button>
                </form>
              )}
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                    }}
                    style={{
                      color: "#4169E1",
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      textDecoration: "none",
                    }}
                  >
                    {t("backToSignIn")}
                  </a>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Paper>
      </motion.div>
    </Box>
  );
}