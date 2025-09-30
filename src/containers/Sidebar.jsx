import React, { useState, useContext, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Dashboard,
  CalendarToday,
  People,
  MedicalServices,
  LocalPharmacy,
  AttachMoney,
  Schedule,
  Analytics,
  Settings,
  HelpCenter,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { ColorModeContext } from '../styles/ColorModeContext';
import { COLOR_PALETTE } from '../styles/color';
import { getToken } from '../config/Auth.jsx';
import { jwtDecode } from 'jwt-decode';

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? 280 : 72,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .MuiDrawer-paper': {
    width: open ? 280 : 72,
    background: theme.palette.mode === 'light' 
      ? COLOR_PALETTE.gradient.drawerLight 
      : COLOR_PALETTE.gradient.drawerDark,
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: theme.palette.mode === 'light' 
      ? '0 4px 20px rgba(65, 105, 225, 0.15)' 
      : '0 4px 20px rgba(0, 0, 0, 0.3)',
    overflowX: 'hidden',
    // Remove scrollbar styling
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    zIndex: 1200,
    marginTop: '80px',
    height: 'calc(100vh - 80px)',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: 12,
  margin: '4px 8px',
  minHeight: 48,
  transition: 'all 0.3s ease',
  background: active ? 
    (theme.palette.mode === 'light' 
      ? COLOR_PALETTE.gradient.activeLight 
      : COLOR_PALETTE.gradient.activeDark) 
    : 'transparent',
  color: active ? 'white' : theme.palette.text.primary,
  '&:hover': {
    background: active ? 
      (theme.palette.mode === 'light' 
        ? COLOR_PALETTE.gradient.activeLight 
        : COLOR_PALETTE.gradient.activeDark) 
      : alpha(theme.palette.primary.main, 0.08),
    transform: active ? 'none' : 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    color: active ? 'white' : theme.palette.primary.main,
    minWidth: 0, // Important for centered icons when closed
    transition: 'all 0.3s ease',
    justifyContent: 'center', // Center icons when closed
  },
  '& .MuiListItemText-primary': {
    fontWeight: active ? 600 : 500,
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const NestedListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: 8,
  margin: '2px 16px 2px 32px',
  minHeight: 40,
  transition: 'all 0.2s ease',
  background: active ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
  border: active ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateX(2px)',
  },
  '& .MuiListItemText-primary': {
    fontSize: '0.85rem',
    fontWeight: active ? 600 : 400,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const ToggleButton = styled(IconButton)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  margin: '16px 8px 8px',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
}));

const MobileToggleButton = styled(IconButton)(({ theme }) => ({
  background: theme.palette.mode === 'light' 
    ? COLOR_PALETTE.gradient.activeLight 
    : COLOR_PALETTE.gradient.activeDark,
  color: 'white',
  boxShadow: '0 4px 12px rgba(65, 105, 225, 0.3)',
  '&:hover': {
    background: theme.palette.mode === 'light' 
      ? COLOR_PALETTE.gradient.activeLight 
      : COLOR_PALETTE.gradient.activeDark,
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(65, 105, 225, 0.4)',
  },
  transition: 'all 0.3s ease',
}));

export default function Sidebar({ onToggle }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [expandedItems, setExpandedItems] = useState({});
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
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

  // Handle URL token parameter (for Google auth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/dashboard');
      // Reload user data after token is set
      window.location.reload();
    }
  }, [location]);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <Dashboard />,
      path: 'dashboard',
      nested: false
    },
    {
      label: 'Appointments',
      icon: <CalendarToday />,
      path: 'appointments',
      nested: true,
      children: [
        { label: 'Schedule Appointment', path: 'appointments/schedule' },
        { label: 'Appointment Calendar', path: 'appointments/calendar' },
        { label: 'Appointment History', path: 'appointments/history' },
      ]
    },
    {
      label: 'Patients',
      icon: <People />,
      path: 'patients',
      nested: true,
      children: [
        { label: 'Patient List', path: 'patients/list' },
        { label: 'Add New Patient', path: 'patients/add' },
        { label: 'Patient Profiles', path: 'patients/profiles' },
      ]
    },
    {
      label: 'Medical Records',
      icon: <MedicalServices />,
      path: 'medical-records',
      nested: true,
      children: [
        { label: 'Patient Records', path: 'medical-records/patient' },
        { label: 'Treatment History', path: 'medical-records/treatment' },
        { label: 'Lab Results', path: 'medical-records/lab' },
        { label: 'Prescriptions', path: 'medical-records/prescriptions' },
      ]
    },
    {
      label: 'Medicines',
      icon: <LocalPharmacy />,
      path: 'medicines',
      nested: true,
      children: [
        { label: 'Medicine Inventory', path: 'medicines/inventory' },
        { label: 'Stock Management', path: 'medicines/stock' },
        { label: 'Suppliers', path: 'medicines/suppliers' },
      ]
    },
    {
      label: 'Financial Management',
      icon: <AttachMoney />,
      path: 'financial',
      nested: true,
      children: [
        { label: 'Billing & Invoices', path: 'financial/billing' },
        { label: 'Payment History', path: 'financial/payments' },
        { label: 'Expense Tracking', path: 'financial/expenses' },
        { label: 'Financial Reports', path: 'financial/reports' },
      ]
    },
    {
      label: 'Availability',
      icon: <Schedule />,
      path: 'availability',
      nested: true,
      children: [
        { label: 'Schedule Management', path: 'availability/schedule' },
        { label: 'Time Slots', path: 'availability/slots' },
        { label: 'Messaging Center', path: 'availability/messaging' },
        { label: 'Notifications', path: 'availability/notifications' },
      ]
    },
    {
      label: 'Analytics',
      icon: <Analytics />,
      path: 'analytics',
      nested: true,
      children: [
        { label: 'Patient Analytics', path: 'analytics/patients' },
        { label: 'Financial Analytics', path: 'analytics/financial' },
        { label: 'Performance Reports', path: 'analytics/performance' },
        { label: 'Custom Reports', path: 'analytics/custom' },
      ]
    },
    {
      label: 'Settings',
      icon: <Settings />,
      path: 'settings',
      nested: true,
      children: [
        { label: 'Profile Settings', path: 'settings/profile' },
        { label: 'Clinic Settings', path: 'settings/clinic' },
        { label: 'User Management', path: 'settings/users' },
        { label: 'System Preferences', path: 'settings/preferences' },
      ]
    },
    {
      label: 'Help Center',
      icon: <HelpCenter />,
      path: 'help',
      nested: false
    }
  ];

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (onToggle) {
      onToggle(newOpen);
    }
  };

  const handleItemClick = (item) => {
    setActiveItem(item.label);
    if (item.nested) {
      setExpandedItems(prev => ({
        ...prev,
        [item.label]: !prev[item.label]
      }));
    }
    
    if (!item.nested) {
      console.log(`Navigating to: ${item.path}`);
    }
  };

  const handleNestedItemClick = (nestedItem, parentLabel) => {
    setActiveItem(nestedItem.label);
    console.log(`Navigating to: ${nestedItem.path}`);
  };

  const handleMobileItemClick = (item) => {
    handleItemClick(item);
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleMobileNestedItemClick = (nestedItem, parentLabel) => {
    handleNestedItemClick(nestedItem, parentLabel);
    if (isMobile) {
      setOpen(false);
    }
  };

  // Get medical specialty or fallback
  const getMedicalSpecialty = () => {
    if (!userData || !userData.medicalSpecialty) return 'Medical Professional';
    return userData.medicalSpecialty;
  };

  return (
    <>
      <StyledDrawer 
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: isMobile ? (open ? 'block' : 'none') : 'block', md: 'block' }
        }}
      >
        {/* Header with Toggle Button */}
        <Box sx={{ 
          p: 2, 
          position: 'sticky', 
          top: 0, 
          background: 'inherit', 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: open ? 'stretch' : 'center', // Center when closed
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: open ? 'space-between' : 'center', // Center when closed
            mb: open ? 2 : 0, // Remove margin when closed
          }}>
            {open && (
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 800,
                  background: theme.palette.mode === 'light' 
                    ? COLOR_PALETTE.gradient.activeLight 
                    : COLOR_PALETTE.gradient.activeDark,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.1rem',
                  fontFamily: "'Inter', sans-serif",
                  flex: 1,
                  mr: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                VitaDoc Panel
              </Typography>
            )}
            <ToggleButton 
              onClick={handleToggle}
              size="small"
              sx={{ flexShrink: 0 }}
            >
              {open ? <ChevronLeft /> : <ChevronRight />}
            </ToggleButton>
          </Box>
          
          {open && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 700,
                display: 'block',
                textAlign: 'center',
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontStyle: 'italic',
              }}
            >
              {loading ? 'Loading...' : getMedicalSpecialty()}
            </Typography>
          )}
        </Box>

        {open && <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.1) }} />}

        {/* Menu Items */}
        <Box sx={{ 
          overflowY: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
        }}>
          <List sx={{ 
            px: 1, 
            py: 2,
            // Remove extra padding when closed
            ...(!open && { px: 0.5 })
          }}>
            {menuItems.map((item) => (
              <Box key={item.label}>
                <ListItem 
                  disablePadding 
                  sx={{ 
                    display: 'block',
                    // Center content when closed
                    ...(!open && { display: 'flex', justifyContent: 'center' })
                  }}
                >
                  <StyledListItemButton
                    active={activeItem === item.label}
                    onClick={() => handleMobileItemClick(item)}
                    sx={{
                      justifyContent: open ? 'initial' : 'center', // Center when closed
                      px: open ? 2.5 : 1, // Reduced padding when closed
                      pr: open && item.nested ? 1.5 : 2.5,
                      // Ensure consistent width when closed
                      minWidth: open ? 'auto' : 48,
                      width: open ? 'auto' : 48,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 0, // Remove margin when closed
                        justifyContent: 'center',
                        // Ensure consistent icon size
                        '& .MuiSvgIcon-root': {
                          fontSize: open ? '1.5rem' : '1.4rem', // Slightly smaller when closed
                        }
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      sx={{ 
                        opacity: open ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        mr: open && item.nested ? 2 : 0,
                        // Hide completely when closed to avoid layout issues
                        ...(!open && { display: 'none' })
                      }} 
                    />
                    {item.nested && open && (
                      <Box sx={{ 
                        ml: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 24,
                      }}>
                        {expandedItems[item.label] ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    )}
                  </StyledListItemButton>
                </ListItem>

                {/* Nested Items - Only show when sidebar is open */}
                {item.nested && open && (
                  <Collapse 
                    in={expandedItems[item.label] && open} 
                    timeout="auto" 
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.children.map((nestedItem) => (
                        <ListItem key={nestedItem.label} disablePadding sx={{ display: 'block' }}>
                          <NestedListItemButton
                            active={activeItem === nestedItem.label}
                            onClick={() => handleMobileNestedItemClick(nestedItem, item.label)}
                            sx={{
                              pl: 4,
                              pr: 2,
                            }}
                          >
                            <ListItemText 
                              primary={nestedItem.label} 
                              sx={{ 
                                opacity: 1, // Always visible when parent is open
                                transition: 'opacity 0.2s ease',
                              }} 
                            />
                          </NestedListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Box>
      </StyledDrawer>

      {/* Mobile Toggle for Small Screens */}
      {isMobile && !open && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: 20, 
          left: 20, 
          zIndex: 1199,
        }}>
          <MobileToggleButton
            onClick={handleToggle}
            size="large"
          >
            <MenuIcon />
          </MobileToggleButton>
        </Box>
      )}
    </>
  );
}