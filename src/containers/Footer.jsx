import React, { useState, useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Link,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Brightness4,
  Brightness7,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Security,
  MedicalServices,
  People,
  LocalHospital,
  ArrowForward
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ColorModeContext } from '../styles/ColorModeContext';
import { COLOR_PALETTE } from '../styles/color';
import LogoLight from "../assets/logo-light.png";
import LogoDark from "../assets/logo.png";

// Styled Components
const FooterContainer = styled(Box)(({ theme, sidebaropen, sidebarwidth, ismobile }) => ({
  position: 'fixed',
  bottom: 0,
  left: ismobile ? 0 : (sidebaropen ? sidebarwidth : 72),
  right: 0,
  height: 'auto', // Changed from fixed height to auto
  background: theme.palette.mode === 'light' 
    ? COLOR_PALETTE.gradient.footerLight 
    : COLOR_PALETTE.gradient.footerDark,
  backdropFilter: 'blur(20px)',
  borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: theme.palette.mode === 'light' 
    ? '0 -4px 30px rgba(65, 105, 225, 0.15)' 
    : '0 -4px 30px rgba(0, 0, 0, 0.3)',
  transition: theme.transitions.create(['left', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  zIndex: 1100,
  overflow: 'hidden', // Prevent content overflow
}));

const FooterContent = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3), // Reduced padding
  paddingBottom: theme.spacing(2),
  maxHeight: '60vh', // Limit maximum height
  overflowY: 'auto', // Add scroll if content is too tall
  '&::-webkit-scrollbar': {
    display: 'none', // Hide scrollbar
  },
}));

const QuickActionCard = styled(Card)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 32px ${alpha(COLOR_PALETTE.primary, 0.2)}`,
    background: alpha(theme.palette.primary.main, 0.1),
  },
}));

const SocialIconButton = styled(IconButton)(({ theme, platform }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  margin: theme.spacing(0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: platform === 'facebook' ? alpha('#1877F2', 0.2) :
               platform === 'twitter' ? alpha('#1DA1F2', 0.2) :
               platform === 'linkedin' ? alpha('#0A66C2', 0.2) :
               platform === 'instagram' ? alpha('#E4405F', 0.2) :
               alpha(theme.palette.primary.main, 0.2),
    transform: 'scale(1.1)',
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: theme.palette.mode === 'light' 
    ? COLOR_PALETTE.gradient.activeLight 
    : COLOR_PALETTE.gradient.activeDark,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  transition: 'all 0.2s ease',
  display: 'block',
  marginBottom: theme.spacing(1),
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(4px)',
  },
}));

const ExpandableSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const ExpandableHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  padding: theme.spacing(1, 0),
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
    borderRadius: 8,
  },
}));

export default function Footer({ sidebarOpen, sidebarWidth }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [expandedSections, setExpandedSections] = useState({
    quickLinks: !isMobile,
    services: !isMobile,
    support: !isMobile,
    contact: !isMobile
  });

  const toggleSection = (section) => {
    if (isMobile) {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    }
  };

  // Quick actions data
  const quickActions = [
    {
      icon: <LocalHospital sx={{ color: COLOR_PALETTE.primary, fontSize: 32 }} />,
      title: t('bookAppointment'),
      description: t('bookAppointmentDesc'),
      action: () => console.log('Book appointment')
    },
    {
      icon: <MedicalServices sx={{ color: COLOR_PALETTE.secondary, fontSize: 32 }} />,
      title: t('emergencyCare'),
      description: t('emergencyCareDesc'),
      action: () => console.log('Emergency care')
    },
    {
      icon: <People sx={{ color: COLOR_PALETTE.accent, fontSize: 32 }} />,
      title: t('findDoctor'),
      description: t('findDoctorDesc'),
      action: () => console.log('Find doctor')
    },
    {
      icon: <Security sx={{ color: COLOR_PALETTE.success, fontSize: 32 }} />,
      title: t('patientPortal'),
      description: t('patientPortalDesc'),
      action: () => console.log('Patient portal')
    }
  ];

  // Footer links data
  const footerLinks = {
    quickLinks: [
      { label: t('home'), path: '/' },
      { label: t('aboutUs'), path: '/about' },
      { label: t('services'), path: '/services' },
      { label: t('doctors'), path: '/doctors' },
      { label: t('testimonials'), path: '/testimonials' },
      { label: t('blog'), path: '/blog' }
    ],
    services: [
      { label: t('generalMedicine'), path: '/services/general' },
      { label: t('cardiology'), path: '/services/cardiology' },
      { label: t('neurology'), path: '/services/neurology' },
      { label: t('pediatrics'), path: '/services/pediatrics' },
      { label: t('surgery'), path: '/services/surgery' },
      { label: t('emergencyCare'), path: '/services/emergency' }
    ],
    support: [
      { label: t('helpCenter'), path: '/help' },
      { label: t('faq'), path: '/faq' },
      { label: t('privacyPolicy'), path: '/privacy' },
      { label: t('termsOfService'), path: '/terms' },
      { label: t('contactSupport'), path: '/contact' },
      { label: t('feedback'), path: '/feedback' }
    ]
  };

  // Contact information
  const contactInfo = [
    {
      icon: <Phone sx={{ color: COLOR_PALETTE.primary, fontSize: 20 }} />,
      text: '+1 (555) 123-4567',
      subtext: t('emergencyHotline')
    },
    {
      icon: <Email sx={{ color: COLOR_PALETTE.secondary, fontSize: 20 }} />,
      text: 'info@medpanel.com',
      subtext: t('generalInquiries')
    },
    {
      icon: <LocationOn sx={{ color: COLOR_PALETTE.accent, fontSize: 20 }} />,
      text: '123 Medical Center Dr',
      subtext: 'Suite 100, City, State 12345'
    },
    {
      icon: <AccessTime sx={{ color: COLOR_PALETTE.success, fontSize: 20 }} />,
      text: '24/7 Emergency Services',
      subtext: 'Mon-Fri: 8AM-6PM, Sat: 9AM-1PM'
    }
  ];

  // Social media platforms
  const socialMedia = [
    { platform: 'facebook', icon: <Facebook />, url: '#' },
    { platform: 'twitter', icon: <Twitter />, url: '#' },
    { platform: 'linkedin', icon: <LinkedIn />, url: '#' },
    { platform: 'instagram', icon: <Instagram />, url: '#' }
  ];

  return (
    <FooterContainer 
      sidebaropen={sidebarOpen} 
      sidebarwidth={sidebarWidth}
      ismobile={isMobile}
    >
      <FooterContent maxWidth={false}>
        {/* Main Footer Content */}
        <Grid container spacing={3}>
          {/* Logo and Description */}
          <Grid item xs={12} md={isMobile ? 12 : 3}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <img
                  src={theme.palette.mode === 'light' ? LogoLight : LogoDark}
                  alt="MedPanel Logo"
                  style={{ 
                    width: isMobile ? 120 : 140, 
                    height: 'auto',
                    marginRight: isMobile ? 2 : 0,
                    filter: theme.palette.mode === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'none'
                  }}
                />
                {isMobile && (
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                      {t('footerDescription')}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {!isMobile && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.8rem' }}>
                  {t('footerDescription')}
                </Typography>
              )}
              
              {/* Theme Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                  size="small"
                  onClick={colorMode.toggleColorMode}
                  sx={{ 
                    background: alpha(theme.palette.primary.main, 0.1),
                    mr: 1,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.2),
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {theme.palette.mode === 'dark' ? 
                    <Brightness7 sx={{ fontSize: 18, color: COLOR_PALETTE.warning }} /> : 
                    <Brightness4 sx={{ fontSize: 18, color: COLOR_PALETTE.secondary }} />
                  }
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {theme.palette.mode === 'dark' ? t('lightMode') : t('darkMode')}
                </Typography>
              </Box>

              {/* Social Media */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {socialMedia.map((social, index) => (
                  <SocialIconButton
                    key={index}
                    size="small"
                    platform={social.platform}
                    onClick={() => window.open(social.url, '_blank')}
                  >
                    {React.cloneElement(social.icon, { sx: { fontSize: 18 } })}
                  </SocialIconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={isMobile ? 6 : 2} md={2}>
            <ExpandableSection>
              <ExpandableHeader onClick={() => toggleSection('quickLinks')}>
                <SectionTitle variant="h6" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {t('quickLinks')}
                </SectionTitle>
                {isMobile && (
                  expandedSections.quickLinks ? <ExpandLess /> : <ExpandMore />
                )}
              </ExpandableHeader>
              <Collapse in={expandedSections.quickLinks}>
                <List dense sx={{ '& .MuiListItem-root': { py: 0.25 } }}>
                  {footerLinks.quickLinks.map((link, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.25 }}>
                      <FooterLink href={link.path} variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {link.label}
                      </FooterLink>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ExpandableSection>
          </Grid>

          {/* Services */}
          <Grid item xs={6} sm={isMobile ? 6 : 2} md={2}>
            <ExpandableSection>
              <ExpandableHeader onClick={() => toggleSection('services')}>
                <SectionTitle variant="h6" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {t('services')}
                </SectionTitle>
                {isMobile && (
                  expandedSections.services ? <ExpandLess /> : <ExpandMore />
                )}
              </ExpandableHeader>
              <Collapse in={expandedSections.services}>
                <List dense sx={{ '& .MuiListItem-root': { py: 0.25 } }}>
                  {footerLinks.services.map((link, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.25 }}>
                      <FooterLink href={link.path} variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {link.label}
                      </FooterLink>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ExpandableSection>
          </Grid>

          {/* Support */}
          <Grid item xs={6} sm={isMobile ? 6 : 2} md={2}>
            <ExpandableSection>
              <ExpandableHeader onClick={() => toggleSection('support')}>
                <SectionTitle variant="h6" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {t('support')}
                </SectionTitle>
                {isMobile && (
                  expandedSections.support ? <ExpandLess /> : <ExpandMore />
                )}
              </ExpandableHeader>
              <Collapse in={expandedSections.support}>
                <List dense sx={{ '& .MuiListItem-root': { py: 0.25 } }}>
                  {footerLinks.support.map((link, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.25 }}>
                      <FooterLink href={link.path} variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {link.label}
                      </FooterLink>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ExpandableSection>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={6} sm={isMobile ? 6 : 3} md={3}>
            <ExpandableSection>
              <ExpandableHeader onClick={() => toggleSection('contact')}>
                <SectionTitle variant="h6" sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  {t('contactInfo')}
                </SectionTitle>
                {isMobile && (
                  expandedSections.contact ? <ExpandLess /> : <ExpandMore />
                )}
              </ExpandableHeader>
              <Collapse in={expandedSections.contact}>
                <List dense sx={{ '& .MuiListItem-root': { py: 0.25 } }}>
                  {contactInfo.map((info, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {React.cloneElement(info.icon, { sx: { fontSize: 16 } })}
                      </ListItemIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {info.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {info.subtext}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </ExpandableSection>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Divider sx={{ my: 2, borderColor: alpha(theme.palette.primary.main, 0.1) }} />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          py: 1 
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 0.5, sm: 0 }, fontSize: '0.75rem' }}>
            © 2024 MedPanel. {t('allRightsReserved')}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <FooterLink href="/privacy" variant="body2" sx={{ mr: 1, mb: 0, fontSize: '0.75rem' }}>
              {t('privacyPolicy')}
            </FooterLink>
            <FooterLink href="/terms" variant="body2" sx={{ mr: 1, mb: 0, fontSize: '0.75rem' }}>
              {t('termsOfService')}
            </FooterLink>
            <FooterLink href="/sitemap" variant="body2" sx={{ mb: 0, fontSize: '0.75rem' }}>
              {t('sitemap')}
            </FooterLink>
          </Box>
        </Box>
      </FooterContent>
    </FooterContainer>
  );
}