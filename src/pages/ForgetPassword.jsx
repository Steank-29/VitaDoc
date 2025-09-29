import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Card,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Phone,
  Shield,
  Lock,
  ArrowBack,
} from "@mui/icons-material";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/Firebase.config";
import Logo from "../assets/logo.png";
import LogoDark from "../assets/logo-light.png";
import MedicalImage from "../assets/doctor.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
import FlagAR from "../assets/flag-ar.png";
import "react-toastify/dist/ReactToastify.css";

// Premium color palette matching navbar
const PREMIUM_COLORS = {
  primary: '#4169E1',
  secondary: '#6A5ACD',
  accent: '#00B4D8',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  gradient: {
    light: 'linear-gradient(135deg, #4169E1 0%, #6A5ACD 50%, #00B4D8 100%)',
    dark: 'linear-gradient(135deg, #ffffffff 0%, #b5a4cbff 50%, #bbdadcff 100%)',
    authLight: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FF 50%, #E3F2FD 100%)',
    authDark: 'linear-gradient(135deg, #0A0F2D 0%, #1A1F4B 50%, #002A32 100%)',
    buttonLight: 'linear-gradient(135deg, #4169E1 0%, #6A5ACD 100%)',
  }
};

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
  const [themeMode, setThemeMode] = useState('light');
  const recaptchaVerifier = useRef(null);
  const vantaRef = useRef(null);

  // Set English as the default language on mount
  useEffect(() => {
    i18n.changeLanguage("en");
  }, [i18n]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') || 'light';
    setThemeMode(savedTheme);
  }, []);

  // Enhanced Vanta effect with theme support
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
      color: themeMode === 'light' ? 0x4169e1 : 0x00B4D8,
      backgroundColor: themeMode === 'light' ? 0xf8f9fa : 0x0A0F2D,
      points: 12.0,
      maxDistance: 25.0,
      spacing: 18.0,
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [themeMode]);

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

  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    localStorage.setItem('themeMode', newTheme);
  };

  const formFieldStyle = {
    mb: 3,
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      background: themeMode === 'light' ? 'rgba(248, 249, 255, 0.5)' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.1)'}`,
      '&:hover fieldset': { borderColor: PREMIUM_COLORS.primary },
      '&.Mui-focused fieldset': { 
        borderColor: PREMIUM_COLORS.primary,
        boxShadow: `0 0 0 2px ${PREMIUM_COLORS.primary}20`,
      },
    },
    "& .MuiInputBase-input": {
      p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
      fontSize: "clamp(14px, 2vw, 16px)",
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box
      ref={vantaRef}
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      sx={{
        minHeight: "100vh",
        minWidth: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        background: themeMode === 'light' 
          ? PREMIUM_COLORS.gradient.authLight
          : PREMIUM_COLORS.gradient.authDark,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: themeMode === 'light'
            ? 'radial-gradient(circle at 20% 80%, rgba(65, 105, 225, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 80%, rgba(0, 180, 216, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        }}
      />

      {/* Enhanced Language Switcher & Theme Toggle - Circular */}
      <Box
        sx={{
          position: "absolute",
          top: "20px",
          right: i18n.language === "ar" ? "auto" : "20px",
          left: i18n.language === "ar" ? "20px" : "auto",
          zIndex: 3,
          display: 'flex',
          gap: 1,
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            width: 40,
            height: 40,
            bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26, 31, 75, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
            borderRadius: '50%',
            '&:hover': {
              bgcolor: themeMode === 'light' ? 'white' : 'rgba(26, 31, 75, 1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {themeMode === 'light' ? '🌙' : '☀️'}
        </IconButton>

        <IconButton
          onClick={handleMenuOpen}
          aria-label={t(`language.${i18n.language}`)}
          sx={{
            width: 40,
            height: 40,
            bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26, 31, 75, 0.9)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
            borderRadius: '50%',
            '&:hover': {
              bgcolor: themeMode === 'light' ? 'white' : 'rgba(26, 31, 75, 1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            p: 0.5,
          }}
        >
          <img
            src={languages.find((lang) => lang.code === i18n.language)?.flag}
            alt={t(`language.${i18n.language}`)}
            style={{ 
              width: 20, 
              height: 20, 
              borderRadius: '50%',
            }}
          />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            "& .MuiPaper-root": {
              boxShadow: themeMode === 'light' 
                ? "0 8px 32px rgba(65, 105, 225, 0.15)" 
                : "0 8px 32px rgba(0, 0, 0, 0.3)",
              borderRadius: "16px",
              p: 1.5,
              background: themeMode === 'light' 
                ? 'rgba(255, 255, 255, 0.95)' 
                : 'rgba(26, 31, 75, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
              minWidth: 120,
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
              sx={{
                borderRadius: "12px",
                m: 0.5,
                py: 1.5,
                px: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                '&:hover': {
                  bgcolor: themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.2)' : 'rgba(0, 180, 216, 0.2)'}`,
                }}
              >
                <img 
                  src={lang.flag} 
                  alt={lang.label} 
                  style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }} 
                />
              </Box>
              <Typography sx={{ 
                fontSize: '0.9rem',
                color: themeMode === 'light' ? 'text.primary' : 'white',
                fontWeight: 500,
              }}>
                {lang.label}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ width: "100%", maxWidth: 1200, minHeight: 500, maxHeight: "90vh", zIndex: 2 }}
      >
        <Card
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            borderRadius: 4,
            overflow: "hidden",
            background: themeMode === 'light'
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(26, 31, 75, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
            boxShadow: themeMode === 'light'
              ? '0 20px 40px rgba(65, 105, 225, 0.15)'
              : '0 20px 40px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Left Panel - Enhanced Brand Section */}
          <Box
            sx={{
              bgcolor: PREMIUM_COLORS.primary,
              flex: { md: "0 0 40%" },
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              p: 5,
              position: 'relative',
              overflow: 'hidden',
              background: PREMIUM_COLORS.gradient.light,
            }}
          >
            {/* Animated Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            
            <motion.div variants={itemVariants}>
              <Box sx={{ mb: 4, position: 'relative' }}>
                <img
                  src={themeMode === 'light' ? Logo : Logo}
                  alt={t("title")}
                  style={{
                    width: 160,
                    height: 'auto',
                    filter: themeMode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </Box>
            </motion.div>

            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center", my: 3 }}>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={themeMode === 'light' ? MedicalImage : MedicalImage}
                  alt={t("medicalIllustration")}
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    height: "auto",
                    borderRadius: 12,
                  }}
                />
              </motion.div>
            </Box>

            <motion.div variants={itemVariants}>
              <Box sx={{ textAlign: "center", mt: "auto" }}>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px",
                    fontWeight: 400,
                  }}
                >
                  <i className="bi bi-copyright" style={{ marginRight: 4 }} />
                  {t("copyright")}
                </Typography>
              </Box>
            </motion.div>
          </Box>

          {/* Right Panel - Enhanced Password Reset Form */}
          <motion.div
            variants={itemVariants}
            style={{
              flex: "0 0 60%",
              minHeight: 500,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "clamp(20px, 4vw, 40px)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 450,
                maxHeight: "100%",
                overflowY: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              <Box sx={{ textAlign: "end", mb: 4, display: { md: "none" } }}>
                <img
                  src={themeMode === 'light' ? LogoDark : Logo}
                  alt={t("title")}
                  style={{ width: 120, height: 80, borderRadius: 4 }}
                />
              </Box>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h4"
                  sx={{
                    mb: 3,
                    textAlign: "center",
                    fontWeight: 800,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(28px, 5vw, 42px)",
                    background: PREMIUM_COLORS.gradient.light,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t("resetPassword")}
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  sx={{
                    textAlign: "center",
                    color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                    mb: 4,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "clamp(14px, 2vw, 17px)",
                  }}
                >
                  {step === 1 && t("enterContactPrompt")}
                  {step === 2 && t("enterCodePrompt")}
                  {step === 3 && t("createNewPasswordPrompt")}
                </Typography>
              </motion.div>

              <Box id="recaptcha-container" sx={{ display: "none" }} />

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSendCode}
                  >
                    <TextField
                      fullWidth
                      type={usePhone ? "tel" : "email"}
                      placeholder={usePhone ? t("phoneNumber") : t("email")}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      required
                      disabled={isLoading}
                      sx={formFieldStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {usePhone ? (
                              <Phone sx={{ color: PREMIUM_COLORS.primary }} />
                            ) : (
                              <Email sx={{ color: PREMIUM_COLORS.primary }} />
                            )}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ textAlign: "center", mb: 3 }}>
                      <Typography variant="body2" sx={{ 
                        color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {t("orWith")}{" "}
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (usePhone) switchToEmail();
                            else switchToPhone();
                          }}
                          style={{
                            color: PREMIUM_COLORS.primary,
                            fontWeight: 600,
                            fontSize: "clamp(13px, 2vw, 14px)",
                            textDecoration: "none",
                            transition: "color 0.3s ease",
                          }}
                          onMouseEnter={(e) => (e.target.style.color = PREMIUM_COLORS.secondary)}
                          onMouseLeave={(e) => (e.target.style.color = PREMIUM_COLORS.primary)}
                        >
                          {usePhone ? t("email") : t("phoneNumber")}
                        </a>
                      </Typography>
                    </Box>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                          background: PREMIUM_COLORS.gradient.buttonLight,
                          borderRadius: 3,
                          p: 2,
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 3,
                          boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(65, 105, 225, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                          color: 'white',
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          t("sendCode")
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleVerifyCode}
                  >
                    <TextField
                      fullWidth
                      type="text"
                      placeholder={t("Enter Code")}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputProps={{ maxLength: 6 }}
                      required
                      disabled={isLoading}
                      sx={formFieldStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Shield sx={{ color: PREMIUM_COLORS.primary }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                          background: PREMIUM_COLORS.gradient.buttonLight,
                          borderRadius: 3,
                          p: 2,
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 3,
                          boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(65, 105, 225, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                          color: 'white',
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          t("verifyCode")
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.form
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleResetPassword}
                  >
                    <TextField
                      fullWidth
                      type={showNewPassword ? "text" : "password"}
                      placeholder={t("newPassword")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      sx={formFieldStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: PREMIUM_COLORS.primary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              sx={{ color: PREMIUM_COLORS.primary }}
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
                      sx={formFieldStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: PREMIUM_COLORS.primary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                              sx={{ color: PREMIUM_COLORS.primary }}
                            >
                              {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                          background: PREMIUM_COLORS.gradient.buttonLight,
                          borderRadius: 3,
                          p: 2,
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 3,
                          boxShadow: '0 4px 15px rgba(65, 105, 225, 0.3)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(65, 105, 225, 0.4)',
                            transform: 'translateY(-1px)',
                          },
                          transition: 'all 0.3s ease',
                          color: 'white',
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          t("resetPassword")
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography variant="body2" sx={{ 
                  color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.9rem'
                }}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/");
                    }}
                    style={{
                      color: PREMIUM_COLORS.primary,
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    onMouseEnter={(e) => (e.target.style.color = PREMIUM_COLORS.secondary)}
                    onMouseLeave={(e) => (e.target.style.color = PREMIUM_COLORS.primary)}
                  >
                    <ArrowBack sx={{ fontSize: 18 }} />
                    {t("backToSignIn")}
                  </a>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Card>
      </motion.div>
    </Box>
  );
}