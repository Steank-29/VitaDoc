import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from "react-i18next";
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../styles/ColorModeContext';
import { COLOR_PALETTE } from '../styles/color';
import LogoLight from "../assets/logo-light.png";
import LogoDark from "../assets/logo.png";
import FlagEN from "../assets/flag-en.png";
import FlagFR from "../assets/flag-fr.png";
import FlagAR from "../assets/flag-ar.png";
import { getToken, logout } from '../config/Auth.jsx';
import { jwtDecode } from 'jwt-decode';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 25,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(COLOR_PALETTE.primary, 0.3)}`,
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(4),
  width: '100%',
  maxWidth: 450,
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  [theme.breakpoints.up('sm')]: {
    width: 'auto',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.95rem',
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      width: '35ch',
    },
  },
}));

const ColorfulBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: COLOR_PALETTE.gradient.activeLight,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.7rem',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    borderRadius: '0 0 24px 24px',
    background: theme.palette.mode === 'light' 
      ? COLOR_PALETTE.gradient.drawerLight 
      : COLOR_PALETTE.gradient.drawerDark,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '100%',
    padding: theme.spacing(2),
    // Remove scrollbar
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
  },
}));

const ProfileAvatar = styled('img')({
  width: 40,
  height: 40,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid',
});

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const mode = colorMode.mode;
  
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = React.useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch user data on component mount
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Decode token to get user ID
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // Fetch user data from API
        const response = await fetch(`http://localhost:5000/auth/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Set English as default language on component mount
  React.useEffect(() => {
    const currentLanguage = i18n.language;
    if (!currentLanguage || currentLanguage === 'en' || !languages.find(lang => lang.code === currentLanguage)) {
      i18n.changeLanguage("en");
    }
  }, [i18n]);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isLanguageMenuOpen = Boolean(languageAnchorEl);
  const isNotificationOpen = Boolean(notificationAnchorEl);
  const isMessageOpen = Boolean(messageAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMessageOpen = (event) => {
    setMessageAnchorEl(event.currentTarget);
  };

  const handleMessageClose = () => {
    setMessageAnchorEl(null);
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLanguageMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!userData) return t('Dr Jelassi Joury'); // Fallback
    return `Dr ${userData.lastName} ${userData.firstName}`;
  };

  // Get profile picture URL
// Get profile picture URL
const getProfilePicture = () => {
  if (!userData || !userData.picture) return null;
  
  // If it's already a full URL (like from Google), use it directly
  if (userData.picture.startsWith('http')) return userData.picture;
  
  // If it starts with /uploads, construct the full URL correctly
  if (userData.picture.startsWith('/uploads/')) {
    return `http://localhost:5000${userData.picture}`;
  }
  
  // Fallback: if it's just a filename, construct the path
  return `http://localhost:5000/uploads/${userData.picture}`;
};


const ProfileAvatar = styled('img')({
  width: 40,
  height: 40,
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid',
});

// Add this function for image error handling
const handleImageError = (event) => {
  event.target.style.display = 'none';
};

  const languages = [
    { code: "en", flag: FlagEN, label: t("english") },
    { code: "fr", flag: FlagFR, label: t("french") },
    { code: "ar", flag: FlagAR, label: t("arabic") },
  ];

  // Get current language or default to English
  const getCurrentLanguage = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang || languages[0]; // Default to English if not found
  };

  const menuItems = [
    { 
      label: t("profile"), 
      icon: <AccountCircle sx={{ color: COLOR_PALETTE.primary }} />, 
      action: handleMenuClose 
    },
    { 
      label: t("home"), 
      icon: <HomeIcon sx={{ color: COLOR_PALETTE.secondary }} />, 
      action: handleMenuClose 
    },
    { 
      label: t("settings"), 
      icon: <SettingsIcon sx={{ color: COLOR_PALETTE.accent }} />, 
      action: handleMenuClose 
    },
    { 
      label: t("support"), 
      icon: <SupportAgentIcon sx={{ color: COLOR_PALETTE.success }} />, 
      action: handleMenuClose 
    },
    {
      label: t("logout"),
      icon: <LogoutIcon sx={{ color: COLOR_PALETTE.error }} />,
      action: handleLogout,
      color: COLOR_PALETTE.error,
    },
  ];

  const notificationItems = [
    t('New patient appointment scheduled for tomorrow'),
    t('System update available'),
    t('New message from admin'),
    t('Reminder: Complete your profile'),
    t('Payment received for consultation'),
  ];

  const messageItems = [
    t('Hello, how can I help you today?'),
    t('Your appointment is confirmed.'),
    t('Please update your payment information.'),
    t('Thank you for your feedback.'),
  ];

  const getIconColor = (mode) => {
    const colors = {
      mail: mode === 'light' ? COLOR_PALETTE.accent : '#00E5FF',
      notification: mode === 'light' ? COLOR_PALETTE.warning : '#FFB74D',
      profile: mode === 'light' ? COLOR_PALETTE.primary : '#7986CB',
      theme: mode === 'light' ? COLOR_PALETTE.secondary : '#BA68C8',
    };
    return colors;
  };

  const iconColors = getIconColor(mode);

  // Mobile Drawer Content
  const renderMobileDrawer = () => (
    <MobileDrawer
      anchor="top"
      open={mobileDrawerOpen}
      onClose={toggleMobileDrawer}
      sx={{
        display: { xs: 'block', md: 'none' },
      }}
    >
      <Box sx={{ p: 2, mt: 10 }}>
        {/* Header with Doctor Name */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 800,
              background: COLOR_PALETTE.gradient.activeLight,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.25rem',
            }}>
              {getUserDisplayName()}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
            }}>
              {t('Medical Professional')}
            </Typography>
          </Box>
          <IconButton 
            onClick={toggleMobileDrawer}
            sx={{
              background: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { background: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search for Mobile */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            position: 'relative',
            borderRadius: 20,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <SearchIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <InputBase
              placeholder={t("search")}
              sx={{ color: theme.palette.text.primary, flex: 1 }}
            />
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
          <IconButton 
            onClick={handleMessageOpen}
            sx={{
              flexDirection: 'column',
              background: alpha(iconColors.mail, 0.1),
              borderRadius: 3,
              p: 2,
              minWidth: 80,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: alpha(iconColors.mail, 0.2),
                transform: 'translateY(-2px)',
              }
            }}
          >
            <ColorfulBadge badgeContent={4} color="error">
              <MailIcon sx={{ color: iconColors.mail, fontSize: 28 }} />
            </ColorfulBadge>
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600 }}>
              {t("messages")}
            </Typography>
          </IconButton>

          <IconButton 
            onClick={handleNotificationOpen}
            sx={{
              flexDirection: 'column',
              background: alpha(iconColors.notification, 0.1),
              borderRadius: 3,
              p: 2,
              minWidth: 80,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: alpha(iconColors.notification, 0.2),
                transform: 'translateY(-2px)',
              }
            }}
          >
            <ColorfulBadge badgeContent={17} color="error">
              <NotificationsIcon sx={{ color: iconColors.notification, fontSize: 28 }} />
            </ColorfulBadge>
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600 }}>
              {t("notifications")}
            </Typography>
          </IconButton>

          <IconButton 
            onClick={colorMode.toggleColorMode}
            sx={{
              flexDirection: 'column',
              background: alpha(iconColors.theme, 0.1),
              borderRadius: 3,
              p: 2,
              minWidth: 80,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: alpha(iconColors.theme, 0.2),
                transform: 'translateY(-2px)',
              }
            }}
          >
            {mode === 'dark' ? 
              <Brightness7Icon sx={{ color: iconColors.theme, fontSize: 28 }} /> : 
              <Brightness4Icon sx={{ color: iconColors.theme, fontSize: 28 }} />
            }
            <Typography variant="caption" sx={{ mt: 1, fontWeight: 600 }}>
              {mode === 'dark' ? t("lightMode") : t("darkMode")}
            </Typography>
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Language Selector - Centered */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: theme.palette.text.secondary,
            textAlign: 'center'
          }}>
            {t("language")}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: 2 
          }}>
            {languages.map((lang) => (
              <IconButton
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                sx={{
                  flexDirection: 'column',
                  background: i18n.language === lang.code ? 
                    alpha(theme.palette.primary.main, 0.2) : 
                    alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 3,
                  p: 1.5,
                  minWidth: 70,
                  border: i18n.language === lang.code ? 
                    `2px solid ${theme.palette.primary.main}` : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              >
                <img
                  src={lang.flag}
                  alt={lang.label}
                  style={{ width: 24, height: 24, borderRadius: '50%' }}
                />
                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {lang.code.toUpperCase()}
                </Typography>
              </IconButton>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Menu Items */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => {
                item.action();
                toggleMobileDrawer();
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: item.color || theme.palette.text.primary,
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </MobileDrawer>
  );

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "16px",
          minWidth: 240,
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          overflow: 'hidden',
          mt: 1.5,
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          // Remove scrollbar
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
        },
      }}
    >
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
          onClick={item.action}
          sx={{
            py: 1.75,
            px: 2.5,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            color: item.color || theme.palette.text.primary,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(4px)',
            },
            borderBottom: index < menuItems.length - 1 
              ? `1px solid ${alpha(theme.palette.primary.main, 0.05)}` 
              : 'none',
          }}
        >
          <Box sx={{ mr: 2 }}>
            {item.icon}
          </Box>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );

  const renderNotificationMenu = (
    <Menu
      anchorEl={notificationAnchorEl}
      open={isNotificationOpen}
      onClose={handleNotificationClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "16px",
          minWidth: 320,
          maxHeight: 400,
          overflowY: 'auto',
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          // Remove scrollbar
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
        },
      }}
    >
      <Typography sx={{ 
        px: 2.5, 
        py: 2, 
        fontWeight: 700, 
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, 
        color: theme.palette.text.primary,
        background: alpha(theme.palette.primary.main, 0.03),
      }}>
        {t("notifications")}
      </Typography>
      {notificationItems.map((item, index) => (
        <MenuItem key={index} sx={{ 
          py: 1.75, 
          px: 2.5,
          whiteSpace: 'normal', 
          color: theme.palette.text.primary,
          borderBottom: index < notificationItems.length - 1 
            ? `1px solid ${alpha(theme.palette.primary.main, 0.05)}` 
            : 'none',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.06),
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: COLOR_PALETTE.gradient.activeLight,
              mt: 0.75,
              mr: 2,
              flexShrink: 0
            }} />
            <Typography variant="body2">
              {item}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );

  const renderMessageMenu = (
    <Menu
      anchorEl={messageAnchorEl}
      open={isMessageOpen}
      onClose={handleMessageClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "16px",
          minWidth: 320,
          maxHeight: 400,
          overflowY: 'auto',
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          // Remove scrollbar
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
        },
      }}
    >
      <Typography sx={{ 
        px: 2.5, 
        py: 2, 
        fontWeight: 700, 
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, 
        color: theme.palette.text.primary,
        background: alpha(theme.palette.primary.main, 0.03),
      }}>
        {t("messages")}
      </Typography>
      {messageItems.map((item, index) => (
        <MenuItem key={index} sx={{ 
          py: 1.75, 
          px: 2.5,
          whiteSpace: 'normal', 
          color: theme.palette.text.primary,
          borderBottom: index < messageItems.length - 1 
            ? `1px solid ${alpha(theme.palette.primary.main, 0.05)}` 
            : 'none',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.06),
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: COLOR_PALETTE.gradient.activeLight,
              mt: 0.75,
              mr: 2,
              flexShrink: 0
            }} />
            <Typography variant="body2">
              {item}
            </Typography>
          </Box>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Box sx={{ width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 1300 }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          width: '100%', 
          height: 80, 
          justifyContent: 'center', 
          background: mode === 'light' 
            ? COLOR_PALETTE.gradient.navbarLight 
            : COLOR_PALETTE.gradient.navbarDark,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          boxShadow: mode === 'light' 
            ? '0 4px 20px rgba(65, 105, 225, 0.15)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          color: theme.palette.text.primary,
          px: { xs: 2, md: 4 } 
        }}>
          {/* Logo Section - Always on left */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: { xs: 100, md: 200 },
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.02)',
            }
          }}>
            <img
              src={mode === 'light' ? LogoLight : LogoDark}
              alt="Logo"
              style={{ 
                width: 140, 
                height: 80, 
                borderRadius: 8,
                filter: mode === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'none'
              }}
            />
          </Box>

          {/* Center Title - Show on ALL screen sizes including web */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
          }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                letterSpacing: "1px",
                fontSize: { 
                  xs: "clamp(16px, 4vw, 18px)", 
                  sm: "clamp(18px, 4vw, 20px)", 
                  md: "clamp(20px, 4vw, 22px)",
                  lg: "24px" 
                },
                color: theme.palette.text.primary,
                background: mode === 'light' 
                  ? COLOR_PALETTE.gradient.activeLight 
                  : COLOR_PALETTE.gradient.activeDark,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              {getUserDisplayName()}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            gap: 0.5
          }}>
            {/* Desktop Search */}
            <Box sx={{ mr: { xs: 0, md: 2 } }}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon sx={{ color: theme.palette.primary.main }} />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder={t("search")}
                  inputProps={{ 'aria-label': 'search' }}
                  sx={{ color: theme.palette.text.primary }}
                />
              </Search>
            </Box>

            {/* Desktop Icons */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="large"
                onClick={colorMode.toggleColorMode}
                aria-label={mode === 'dark' ? t("lightMode") : t("darkMode")}
                sx={{ 
                  background: alpha(iconColors.theme, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.theme, 0.2),
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {mode === 'dark' ? 
                  <Brightness7Icon sx={{ color: iconColors.theme }} /> : 
                  <Brightness4Icon sx={{ color: iconColors.theme }} />
                }
              </IconButton>

              <IconButton
                size="large"
                onClick={handleLanguageMenuOpen}
                aria-label={t(`language.${i18n.language}`)}
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    background: alpha(theme.palette.primary.main, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <img
                  src={getCurrentLanguage().flag}
                  alt={getCurrentLanguage().label}
                  style={{ 
                    width: 22, 
                    height: 22, 
                    borderRadius: '50%',
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                />
              </IconButton>

              {/* Language Menu for Desktop */}
              <Menu
                anchorEl={languageAnchorEl}
                open={isLanguageMenuOpen}
                onClose={handleLanguageMenuClose}
                sx={{
                  "& .MuiPaper-root": {
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                    borderRadius: "12px",
                    p: 1,
                    background: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    // Remove scrollbar
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    '-ms-overflow-style': 'none',
                    scrollbarWidth: 'none',
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
                      py: 1.5,
                      px: 2,
                      borderRadius: "8px",
                      mb: 0.5,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'translateX(4px)',
                      },
                      color: theme.palette.text.primary,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img 
                      src={lang.flag} 
                      alt={lang.label} 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        marginRight: 12, 
                        borderRadius: '50%',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }} 
                    />
                    {lang.label}
                  </MenuItem>
                ))}
              </Menu>

              <IconButton 
                size="large" 
                aria-label="show 4 new mails" 
                sx={{ 
                  background: alpha(iconColors.mail, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.mail, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }} 
                onClick={handleMessageOpen}
              >
                <ColorfulBadge badgeContent={4} color="error">
                  <MailIcon sx={{ color: iconColors.mail }} />
                </ColorfulBadge>
              </IconButton>
              
              <IconButton
                size="large"
                aria-label="show 17 new notifications"
                sx={{ 
                  background: alpha(iconColors.notification, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.notification, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
                onClick={handleNotificationOpen}
              >
                <ColorfulBadge badgeContent={17} color="error">
                  <NotificationsIcon sx={{ color: iconColors.notification }} />
                </ColorfulBadge>
              </IconButton>
              
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ 
                  background: alpha(iconColors.profile, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.profile, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {getProfilePicture() ? (
                  <ProfileAvatar 
                    src={getProfilePicture()} 
                    alt="Profile"
                    sx={{ 
                      borderColor: iconColors.profile,
                    }}
                  />
                ) : (
                  <AccountCircle sx={{ fontSize: 32, color: iconColors.profile }} />
                )}
              </IconButton>
            </Box>

            {/* Mobile & Tablet Icons - Theme Toggle + Menu */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
              {/* Theme Toggle Button */}
              <IconButton
                size="large"
                onClick={colorMode.toggleColorMode}
                aria-label={mode === 'dark' ? t("lightMode") : t("darkMode")}
                sx={{ 
                  background: alpha(iconColors.theme, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.theme, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {mode === 'dark' ? 
                  <Brightness7Icon sx={{ color: iconColors.theme, fontSize: 24 }} /> : 
                  <Brightness4Icon sx={{ color: iconColors.theme, fontSize: 24 }} />
                }
              </IconButton>

              {/* Mobile Menu Button - Triggers Drawer */}
              <IconButton
                size="large"
                aria-label="open mobile menu"
                onClick={toggleMobileDrawer}
                sx={{ 
                  background: alpha(iconColors.profile, 0.1),
                  '&:hover': { 
                    background: alpha(iconColors.profile, 0.2),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <MenuIcon sx={{ fontSize: 28, color: iconColors.profile }} />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {renderMobileDrawer()}

      {/* Existing Menus */}
      {renderMenu}
      {renderNotificationMenu}
      {renderMessageMenu}
    </Box>
  );
}