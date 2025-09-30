// src/layouts/MainLayout.jsx
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from '../containers/Navbar';
import Sidebar from '../containers/Sidebar';

const MainContent = styled(Box)(({ theme, sidebaropen }) => ({
  marginLeft: sidebaropen ? 280 : 72,
  marginTop: '80px', // Navbar height
  minHeight: 'calc(100vh - 80px - 60px)', // Subtract navbar and footer heights
  padding: theme.spacing(3),
  transition: theme.transitions.create(['margin-left'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
  },
}));

const PageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const ContentArea = styled(Box)({
  flex: 1,
  display: 'flex',
});

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  // Handle sidebar state changes
  const handleSidebarToggle = (open) => {
    setSidebarOpen(open);
  };

  return (
    <PageContainer>
      {/* Navbar - Fixed at top */}
      <Navbar />
      
      <ContentArea>
        {/* Sidebar - Fixed left */}
        <Sidebar onToggle={handleSidebarToggle} />
        
        {/* Main Content Area */}
        <MainContent sidebaropen={sidebarOpen ? 1 : 0}>
          {children}
        </MainContent>
      </ContentArea>
      

    </PageContainer>
  );
}