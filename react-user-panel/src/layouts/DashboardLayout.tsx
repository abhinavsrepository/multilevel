import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Zoom,
  useTheme,
  useMediaQuery,
  Toolbar,
} from '@mui/material';
import {
  KeyboardArrowUp as ScrollTopIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import Breadcrumb from '../components/common/Breadcrumb';
import { useAppSelector } from '../redux/store';
import { selectSidebarCollapsed } from '../redux/slices/themeSlice';

/**
 * DashboardLayout Props
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  showFooter?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  title?: string;
}

/**
 * DashboardLayout Component
 *
 * Main layout for all dashboard pages
 * Features:
 * - Header (top)
 * - Sidebar (left, collapsible)
 * - Main content area
 * - Footer (bottom)
 * - Breadcrumb navigation
 * - Scroll to top button
 * - Responsive (sidebar becomes drawer on mobile)
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  showBreadcrumb = true,
  showFooter = true,
  maxWidth = 'xl',
  title,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  /**
   * Sidebar width calculation
   */
  const sidebarWidth = !isMobile ? (sidebarCollapsed ? 70 : 260) : 0;

  /**
   * Handle scroll to top button visibility
   */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Scroll to top function
   */
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /**
   * Scroll to top on route change
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Header */}
        <Header title={title} />

        {/* Add Toolbar spacing to prevent content from going under fixed header */}
        <Toolbar />

        {/* Breadcrumb */}
        {showBreadcrumb && <Breadcrumb />}

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 2, sm: 3 },
                  maxWidth: maxWidth ? theme.breakpoints.values[maxWidth] : '100%',
                  width: '100%',
                  mx: maxWidth ? 'auto' : 0,
                }}
              >
                {children}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Footer */}
        {showFooter && <Footer minimal />}
      </Box>

      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Fab
          onClick={handleScrollToTop}
          color="primary"
          size="medium"
          aria-label="scroll back to top"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: theme.zIndex.speedDial,
            boxShadow: theme.shadows[8],
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[12],
            },
            transition: 'all 0.3s ease',
          }}
        >
          <ScrollTopIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default DashboardLayout;
