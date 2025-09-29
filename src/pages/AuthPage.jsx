import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
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
  Paper,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Card,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  CalendarToday,
  LocationOn,
  Phone,
  Lock,
  Image,
  CheckCircle,
  Transgender,
  CloudUpload,
} from "@mui/icons-material";
import Logo from "../assets/logo.png";
import LogoDark from "../assets/logo-light.png";
import MedicalImage from "../assets/doctor.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
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

export default function AuthPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [uploadedImage, setUploadedImage] = useState(null);
  const dateInputRef = useRef(null);
  const genderSelectRef = useRef(null);
  const specialtySelectRef = useRef(null);
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
  ];

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;
  const validatePhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone);
  const validateName = (name) => name.length >= 2;

  const getPasswordStrength = (password) => {
    if (!password) return { strength: "none", color: "transparent" };
    if (password.length < 6) return { strength: "weak", color: PREMIUM_COLORS.error };
    if (password.length < 10) return { strength: "medium", color: PREMIUM_COLORS.warning };
    return { strength: "strong", color: PREMIUM_COLORS.success };
  };

  const getConfirmPasswordIconColor = () => {
    if (!confirmPassword) return "#6c757d";
    return password === confirmPassword ? PREMIUM_COLORS.success : PREMIUM_COLORS.error;
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setUploadedImage(e.target.result);
      reader.readAsDataURL(file);
    }
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

      {/* Enhanced Language Switcher & Theme Toggle */}
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
  {/* Theme Toggle Button - Perfect Circle */}
  <IconButton
    onClick={toggleTheme}
    sx={{
      width: 40,
      height: 40,
      bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26, 31, 75, 0.9)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
      borderRadius: '50%', // Perfect circle
      '&:hover': {
        bgcolor: themeMode === 'light' ? 'white' : 'rgba(26, 31, 75, 1)',
        transform: 'scale(1.1)',
      },
      transition: 'all 0.3s ease',
    }}
  >
    {themeMode === 'light' ? '🌙' : '☀️'}
  </IconButton>

  {/* Language Button - Perfect Circle */}
  <IconButton
    onClick={handleMenuOpen}
    aria-label={t(`language.${i18n.language}`)}
    sx={{
      width: 40,
      height: 40,
      bgcolor: themeMode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(26, 31, 75, 0.9)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.1)' : 'rgba(0, 180, 216, 0.1)'}`,
      borderRadius: '50%', // Perfect circle
      '&:hover': {
        bgcolor: themeMode === 'light' ? 'white' : 'rgba(26, 31, 75, 1)',
        transform: 'scale(1.1)',
      },
      transition: 'all 0.3s ease',
      p: 0.5, // Add some padding for the flag
    }}
  >
    <img
      src={languages.find((lang) => lang.code === i18n.language)?.flag}
      alt={t(`language.${i18n.language}`)}
      style={{ 
        width: 20, 
        height: 20, 
        borderRadius: '50%', // Flag also circular
      }}
    />
  </IconButton>
  
  {/* Language Menu with Circular Items */}
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
        {/* Circular Flag Container */}
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
                  src={themeMode === 'light' ? Logo : LogoDark}
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

          {/* Right Panel - Enhanced Authentication Form */}
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
                  {t("title")}
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
                  {isSignUp ? t("signUpPrompt") : t("signInPrompt")}
                </Typography>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={isSignUp ? 'signup' : 'signin'}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={isSignUp ? handleSignUp : handleSignIn}
                >
                  {isSignUp && (
                    <>
                      <TextField
                        fullWidth
                        name="firstName"
                        placeholder={t("firstName")}
                        required
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        name="lastName"
                        placeholder={t("lastName")}
                        required
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  )}
                  
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    placeholder={t("email")}
                    required
                    disabled={isLoading}
                    sx={formFieldStyle}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: PREMIUM_COLORS.primary }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {isSignUp && (
                    <>
                      <FormControl fullWidth sx={formFieldStyle}>
                        <InputLabel sx={{ 
                          fontSize: "clamp(14px, 2vw, 16px)",
                          color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        }}>
                          {t("gender")}
                        </InputLabel>
                        <Select
                          name="gender"
                          required
                          disabled={isLoading}
                          inputRef={genderSelectRef}
                          sx={{
                            borderRadius: "12px",
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.1)'}`,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { 
                              borderColor: PREMIUM_COLORS.primary 
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: PREMIUM_COLORS.primary,
                              boxShadow: `0 0 0 2px ${PREMIUM_COLORS.primary}20`,
                            },
                            "& .MuiSelect-select": {
                              p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                              fontSize: "clamp(14px, 2vw, 16px)",
                            },
                          }}
                        >
                          <SelectMenuItem value="" disabled>
                            {t("gender")}
                          </SelectMenuItem>
                          <SelectMenuItem value="male">{t("male")}</SelectMenuItem>
                          <SelectMenuItem value="female">{t("female")}</SelectMenuItem>
                          <SelectMenuItem value="other">{t("other")}</SelectMenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        type="date"
                        name="dateOfBirth"
                        required
                        disabled={isLoading}
                        inputRef={dateInputRef}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <FormControl fullWidth sx={formFieldStyle}>
                        <InputLabel sx={{ 
                          fontSize: "clamp(14px, 2vw, 16px)",
                          color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        }}>
                          {t("medicalSpecialty")}
                        </InputLabel>
                        <Select
                          name="medicalSpecialty"
                          required
                          disabled={isLoading}
                          inputRef={specialtySelectRef}
                          sx={{
                            borderRadius: "12px",
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: `1px solid ${themeMode === 'light' ? 'rgba(65, 105, 225, 0.2)' : 'rgba(255,255,255,0.1)'}`,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': { 
                              borderColor: PREMIUM_COLORS.primary 
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: PREMIUM_COLORS.primary,
                              boxShadow: `0 0 0 2px ${PREMIUM_COLORS.primary}20`,
                            },
                            "& .MuiSelect-select": {
                              p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                              fontSize: "clamp(14px, 2vw, 16px)",
                            },
                          }}
                        >
                          <SelectMenuItem value="" disabled>
                            {t("medicalSpecialty")}
                          </SelectMenuItem>
                          {medicalSpecialties.map(({ key, label }) => (
                            <SelectMenuItem key={key} value={key}>
                              {label}
                            </SelectMenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        fullWidth
                        type="file"
                        name="picture"
                        inputProps={{ accept: "image/*" }}
                        required
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Image sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleImageUpload}
                      />

                      {uploadedImage && (
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                          <img 
                            src={uploadedImage} 
                            alt="Preview" 
                            style={{ 
                              width: 80, 
                              height: 80, 
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `2px solid ${PREMIUM_COLORS.primary}`
                            }} 
                          />
                        </Box>
                      )}
                    </>
                  )}

                  <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("password")}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                            onClick={() => setShowPassword(!showPassword)}
                            sx={{ color: PREMIUM_COLORS.primary }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {isSignUp && password && (
                    <Box sx={{ mb: 2 }}>
                      <Box
                        className="password-strength-indicator"
                        sx={{ 
                          backgroundColor: getPasswordStrength(password).color,
                          height: 4,
                          borderRadius: 2,
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: getPasswordStrength(password).color,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      >
                        {getPasswordStrength(password).strength}
                      </Typography>
                    </Box>
                  )}

                  {isSignUp && (
                    <TextField
                      fullWidth
                      type="password"
                      name="confirmPassword"
                      placeholder={t("confirmPassword")}
                      required
                      disabled={isLoading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      sx={formFieldStyle}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: getConfirmPasswordIconColor() }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {isSignUp && (
                    <>
                      <TextField
                        fullWidth
                        name="location"
                        placeholder={t("location")}
                        required
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        type="tel"
                        name="phoneNumber"
                        placeholder={t("phoneNumber")}
                        required
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        type="tel"
                        name="secondPhoneNumber"
                        placeholder={t("secondPhoneNumber")}
                        disabled={isLoading}
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: PREMIUM_COLORS.primary }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </>
                  )}

                  {!isSignUp && (
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        component="a"
                        href="#"
                        onClick={handleForgotPassword}
                        sx={{
                          fontSize: "clamp(13px, 2vw, 15px)",
                          color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                          textDecoration: "none",
                          fontFamily: "Inter, sans-serif",
                          transition: "color 0.3s ease",
                          "&:hover": { color: PREMIUM_COLORS.primary },
                        }}
                      >
                        {t("forgotPassword")}
                      </Typography>
                    </Box>
                  )}

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
                      ) : isSignUp ? (
                        t("signUp")
                      ) : (
                        t("signIn")
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </AnimatePresence>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box sx={{ 
                  flexGrow: 1, 
                  borderBottom: `1px solid ${themeMode === 'light' ? '#e9ecef' : 'rgba(255,255,255,0.2)'}` 
                }} />
                <Typography sx={{ 
                  px: 3, 
                  color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)', 
                  fontSize: "clamp(12px, 2vw, 13px)" 
                }}>
                  {t("orWith")}
                </Typography>
                <Box sx={{ 
                  flexGrow: 1, 
                  borderBottom: `1px solid ${themeMode === 'light' ? '#e9ecef' : 'rgba(255,255,255,0.2)'}` 
                }} />
              </Box>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  sx={{
                    border: `2px solid ${themeMode === 'light' ? '#4285f4' : '#8ab4f8'}`,
                    borderRadius: "12px",
                    p: "12px",
                    fontWeight: 600,
                    color: themeMode === 'light' ? '#4285f4' : '#8ab4f8',
                    boxShadow: themeMode === 'light' 
                      ? "0 2px 8px rgba(66, 133, 244, 0.2)" 
                      : "0 2px 8px rgba(138, 180, 248, 0.2)",
                    fontSize: "clamp(13px, 2vw, 14px)",
                    height: 48,
                    textTransform: "none",
                    opacity: isLoading ? 0.7 : 1,
                    background: themeMode === 'light' ? 'white' : 'transparent',
                    '&:hover': {
                      bgcolor: themeMode === 'light' ? '#4285f4' : '#8ab4f8',
                      color: "white",
                      border: `2px solid ${themeMode === 'light' ? '#4285f4' : '#8ab4f8'}`,
                      boxShadow: themeMode === 'light' 
                        ? "0 4px 12px rgba(66, 133, 244, 0.3)" 
                        : "0 4px 12px rgba(138, 180, 248, 0.3)",
                    },
                    transition: 'all 0.3s ease',
                  }}
                  startIcon={
                    <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
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
                  }
                >
                  {t("signInWithGoogle")}
                </Button>
              </motion.div>

              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography sx={{ 
                  color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)', 
                  fontSize: "clamp(12px, 2vw, 13px)" 
                }}>
                  {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(!isSignUp);
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
                    {isSignUp ? t("signInHere") : t("signUpHere")}
                  </a>
                </Typography>
              </Box>

              {/* Premium Features Showcase */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Box sx={{ 
                  mt: 4, 
                  p: 3, 
                  borderRadius: 3, 
                  background: themeMode === 'light' 
                    ? 'rgba(65, 105, 225, 0.05)' 
                    : 'rgba(0, 180, 216, 0.05)',
                  border: `1px solid ${themeMode === 'light' 
                    ? 'rgba(65, 105, 225, 0.1)' 
                    : 'rgba(0, 180, 216, 0.1)'}`,
                }}>
                  <Typography variant="h6" sx={{ 
                    mb: 2, 
                    color: PREMIUM_COLORS.primary, 
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}>
                    🎯 Premium Features
                  </Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                    gap: 1 
                  }}>
                    {['Advanced Analytics', '24/7 Support', 'Secure Storage', 'AI Assistance', 'Multi-language', 'Dark Mode'].map((feature) => (
                      <Typography key={feature} sx={{ 
                        fontSize: '0.8rem', 
                        color: themeMode === 'light' ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}>
                        <CheckCircle sx={{ fontSize: 16, color: PREMIUM_COLORS.success }} />
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Card>
      </motion.div>
    </Box>
  );
}