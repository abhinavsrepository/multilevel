import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  LightMode,
  DarkMode,
  Login,
  PersonAdd,
  KeyboardArrowDown,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleThemeMode, selectEffectiveThemeMode } from '../../redux/slices/themeSlice';

interface NavLink {
  label: string;
  path: string;
  children?: NavLink[];
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const themeMode = useSelector(selectEffectiveThemeMode);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const navLinks: NavLink[] = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    {
      label: 'Properties',
      path: '/properties',
      children: [
        { label: 'All Properties', path: '/properties' },
        { label: 'Residential', path: '/properties/residential' },
        { label: 'Commercial', path: '/properties/commercial' },
        { label: 'Luxury', path: '/properties/luxury' },
      ],
    },
    {
      label: 'Business',
      path: '/business',
      children: [
        { label: 'Compensation Plan', path: '/compensation-plan' },
        { label: 'Success Stories', path: '/success-stories' },
        { label: 'Join Us', path: '/register' },
      ],
    },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQs', path: '/faqs' },
  ];

  const handleThemeToggle = () => {
    dispatch(toggleThemeMode());
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, key: string) => {
    setAnchorEl({ ...anchorEl, [key]: event.currentTarget });
  };

  const handleMenuClose = (key: string) => {
    setAnchorEl({ ...anchorEl, [key]: null });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    // Close all menus
    setAnchorEl({});
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              mr: 4,
            }}
            onClick={() => handleNavigate('/')}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: theme.palette.primary.main,
                fontWeight: 700,
              }}
            >
              RE
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Box
                component="span"
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
                }}
              >
                RealEstate
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b',
                  ml: 1,
                }}
              >
                MLM
              </Box>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              {navLinks.map((link) =>
                link.children ? (
                  <Box key={link.label}>
                    <Button
                      onClick={(e) => handleMenuOpen(e, link.label)}
                      endIcon={<KeyboardArrowDown />}
                      sx={{
                        color: 'inherit',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        px: 2,
                        '&:hover': {
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                    <Menu
                      anchorEl={anchorEl[link.label]}
                      open={Boolean(anchorEl[link.label])}
                      onClose={() => handleMenuClose(link.label)}
                      PaperProps={{
                        sx: {
                          mt: 1,
                          minWidth: 200,
                          borderRadius: 2,
                        },
                      }}
                    >
                      {link.children.map((child) => (
                        <MenuItem
                          key={child.path}
                          onClick={() => {
                            handleNavigate(child.path);
                            handleMenuClose(link.label);
                          }}
                        >
                          {child.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                ) : (
                  <Button
                    key={link.path}
                    onClick={() => handleNavigate(link.path)}
                    sx={{
                      color: 'inherit',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      px: 2,
                      '&:hover': {
                        backgroundColor:
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                )
              )}
            </Box>
          )}

          {/* Spacer for mobile */}
          {isMobile && <Box sx={{ flexGrow: 1 }} />}

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <IconButton
              onClick={handleThemeToggle}
              sx={{
                color: 'inherit',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                },
              }}
              aria-label="toggle theme"
            >
              {themeMode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>

            {/* Auth Buttons - Desktop */}
            {!isMobile && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={() => handleNavigate('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => handleNavigate('/register')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton
                onClick={handleMobileMenuToggle}
                sx={{
                  color: 'inherit',
                  ml: 1,
                }}
                aria-label="open menu"
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={handleMobileMenuToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List>
            {navLinks.map((link) => (
              <React.Fragment key={link.label}>
                {link.children ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={(e) => handleMenuOpen(e, `mobile-${link.label}`)}
                      >
                        <ListItemText
                          primary={link.label}
                          primaryTypographyProps={{
                            fontWeight: 600,
                          }}
                        />
                        <KeyboardArrowDown />
                      </ListItemButton>
                    </ListItem>
                    <Menu
                      anchorEl={anchorEl[`mobile-${link.label}`]}
                      open={Boolean(anchorEl[`mobile-${link.label}`])}
                      onClose={() => handleMenuClose(`mobile-${link.label}`)}
                    >
                      {link.children.map((child) => (
                        <MenuItem
                          key={child.path}
                          onClick={() => {
                            handleNavigate(child.path);
                            handleMenuClose(`mobile-${link.label}`);
                          }}
                        >
                          {child.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleNavigate(link.path)}>
                      <ListItemText
                        primary={link.label}
                        primaryTypographyProps={{
                          fontWeight: 600,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </React.Fragment>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          {/* Mobile Auth Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Login />}
              onClick={() => handleNavigate('/login')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PersonAdd />}
              onClick={() => handleNavigate('/register')}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
