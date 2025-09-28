import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "@mui/material";
import Logo from "../assets/logo.png";
import MedicalImage from "../assets/doctor.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
import FlagAR from "../assets/flag-ar.png";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

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
                {t("title")}
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
                {isSignUp ? t("signUpPrompt") : t("signInPrompt")}
              </Typography>
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
                {isSignUp && (
                  <>
                    <TextField
                      fullWidth
                      name="firstName"
                      placeholder={t("firstName")}
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
                            <i className="bi bi-person" />
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
                            <i className="bi bi-person" />
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
                        <i className="bi bi-envelope" />
                      </InputAdornment>
                    ),
                  }}
                />
                {isSignUp && (
                  <>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel sx={{ fontSize: "clamp(14px, 2vw, 16px)" }}>{t("gender")}</InputLabel>
                      <Select
                        name="gender"
                        required
                        disabled={isLoading}
                        inputRef={genderSelectRef}
                        sx={{
                          borderRadius: "10px",
                          border: "2px solid #ced4da",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4169E1" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4169E1",
                            boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                          },
                          "& .MuiSelect-select": {
                            p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                            fontSize: "clamp(14px, 2vw, 16px)",
                          },
                        }}
                        IconComponent={() => (
                          <InputAdornment position="end" sx={{ mr: 1 }}>
                            <i className="bi bi-gender-ambiguous" />
                          </InputAdornment>
                        )}
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
                            <IconButton onClick={() => dateInputRef.current.showPicker()}>
                              <i className="bi bi-calendar" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel sx={{ fontSize: "clamp(14px, 2vw, 16px)" }}>{t("medicalSpecialty")}</InputLabel>
                      <Select
                        name="medicalSpecialty"
                        required
                        disabled={isLoading}
                        inputRef={specialtySelectRef}
                        sx={{
                          borderRadius: "10px",
                          border: "2px solid #ced4da",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4169E1" },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4169E1",
                            boxShadow: "0 0 0 0.2rem rgba(65, 105, 225, 0.25)",
                          },
                          "& .MuiSelect-select": {
                            p: "clamp(12px, 2vw, 14px) clamp(14px, 2vw, 18px)",
                            fontSize: "clamp(14px, 2vw, 16px)",
                          },
                        }}
                        IconComponent={() => (
                          <InputAdornment position="end" sx={{ mr: 1 }}>
                            <i className="bi bi-heart-pulse" />
                          </InputAdornment>
                        )}
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
                            <i className="bi bi-image" />
                          </InputAdornment>
                        ),
                      }}
                    />
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
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {isSignUp && password && (
                  <Box sx={{ mb: 3 }}>
                    <Box
                      className="password-strength-indicator"
                      sx={{ backgroundColor: getPasswordStrength(password).color }}
                    />
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
                          <i className="bi bi-lock" style={{ color: getConfirmPasswordIconColor() }} />
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
                            <i className="bi bi-geo-alt" />
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
                            <i className="bi bi-telephone" />
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
                            <i className="bi bi-telephone" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}
                {!isSignUp && (
                  <Box sx={{ mb: { xs: 3, md: 4 } }}>
                    <Typography
                      component="a"
                      href="#"
                      onClick={handleForgotPassword}
                      sx={{
                        fontSize: "clamp(13px, 2vw, 15px)",
                        color: "text.secondary",
                        textDecoration: "none",
                        fontFamily: "Montserrat, sans-serif",
                        transition: "color 0.3s ease",
                        "&:hover": { color: "#4169E1" },
                      }}
                    >
                      {t("forgotPassword")}
                    </Typography>
                  </Box>
                )}
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
                    mb: { xs: 3, md: 4 },
                    "&:hover": { bgcolor: "#3658C1" },
                  }}
                  startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
                >
                  {isLoading ? (isSignUp ? t("signingUp") : t("signingIn")) : isSignUp ? t("signUp") : t("signIn")}
                </Button>
              </form>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box sx={{ flexGrow: 1, borderBottom: "1px solid #e9ecef" }} />
                <Typography sx={{ px: 3, color: "text.secondary", fontSize: "clamp(12px, 2vw, 13px)" }}>
                  {t("orWith")}
                </Typography>
                <Box sx={{ flexGrow: 1, borderBottom: "1px solid #e9ecef" }} />
              </Box>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                sx={{
                  border: "2px solid #4285f4",
                  borderRadius: "8px",
                  p: "12px",
                  fontWeight: 500,
                  color: "#4285f4",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontSize: "clamp(13px, 2vw, 14px)",
                  height: 44,
                  textTransform: "none",
                  opacity: isLoading ? 0.7 : 1,
                  "&:hover": {
                    bgcolor: "#4285f4",
                    color: "white",
                    border: "2px solid #4285f4",
                  },
                }}
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0, marginRight: 8 }}>
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
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Typography sx={{ color: "text.secondary", fontSize: "clamp(12px, 2vw, 13px)" }}>
                  {isSignUp ? t("alreadyHaveAccount") : t("dontHaveAccount")}{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsSignUp(!isSignUp);
                    }}
                    style={{
                      color: "#4169E1",
                      fontWeight: 600,
                      fontSize: "clamp(13px, 2vw, 14px)",
                      textDecoration: "none",
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#1e50a2")}
                    onMouseLeave={(e) => (e.target.style.color = "#4169E1")}
                  >
                    {isSignUp ? t("signInHere") : t("signUpHere")}
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