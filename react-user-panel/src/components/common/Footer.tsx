import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Grid, IconButton, Divider, useTheme } from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { FaTelegram, FaWhatsapp } from 'react-icons/fa';

interface FooterProps {
  minimal?: boolean;
}

const Footer: React.FC<FooterProps> = ({ minimal = false }) => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  if (minimal) {
    return (
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ fontSize: '0.875rem' }}
            >
              &copy; {currentYear} Ecogram . All rights reserved. | by Abhinav
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                color="text.secondary"
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms-conditions"
                color="text.secondary"
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                Terms & Conditions
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'dark' ? '#0f172a' : '#1e293b',
        color: '#ffffff',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: '#10b981',
              }}
            >
              Ecogram
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: '#cbd5e1',
                lineHeight: 1.7,
              }}
            >
              Your trusted partner in real estate investment. Build wealth through our innovative
              platform.
            </Typography>

            {/* Social Media Icons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton
                size="small"
                sx={{
                  color: '#cbd5e1',
                  '&:hover': { color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                }}
                aria-label="Facebook"
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#cbd5e1',
                  '&:hover': { color: '#1da1f2', backgroundColor: 'rgba(29, 161, 242, 0.1)' },
                }}
                aria-label="Twitter"
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#cbd5e1',
                  '&:hover': { color: '#e1306c', backgroundColor: 'rgba(225, 48, 108, 0.1)' },
                }}
                aria-label="Instagram"
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#cbd5e1',
                  '&:hover': { color: '#0077b5', backgroundColor: 'rgba(0, 119, 181, 0.1)' },
                }}
                aria-label="LinkedIn"
              >
                <LinkedIn fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: '#cbd5e1',
                  '&:hover': { color: '#ff0000', backgroundColor: 'rgba(255, 0, 0, 0.1)' },
                }}
                aria-label="YouTube"
              >
                <YouTube fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
                fontSize: '1rem',
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link
                component={RouterLink}
                to="/about"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                About Us
              </Link>
              <Link
                component={RouterLink}
                to="/properties"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Properties
              </Link>
              <Link
                component={RouterLink}
                to="/compensation-plan"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Compensation Plan
              </Link>
              <Link
                component={RouterLink}
                to="/success-stories"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Success Stories
              </Link>
              <Link
                component={RouterLink}
                to="/faqs"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                FAQs
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
                fontSize: '1rem',
              }}
            >
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link
                component={RouterLink}
                to="/support"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Help Center
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Contact Us
              </Link>
              <Link
                component={RouterLink}
                to="/privacy-policy"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms-conditions"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Terms & Conditions
              </Link>
              <Link
                component={RouterLink}
                to="/refund-policy"
                color="inherit"
                underline="hover"
                sx={{
                  color: '#cbd5e1',
                  fontSize: '0.875rem',
                  '&:hover': { color: '#ffffff' },
                  transition: 'color 0.2s',
                }}
              >
                Refund Policy
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: '#ffffff',
                fontSize: '1rem',
              }}
            >
              Contact Info
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: '1.25rem', color: '#cbd5e1', mt: 0.3 }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                  123 Business Street, Suite 100
                  <br />
                  New York, NY 10001, USA
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: '1.25rem', color: '#cbd5e1' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: '1.25rem', color: '#cbd5e1' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                  support@ecogram.com
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: '#cbd5e1',
                    border: '1px solid #475569',
                    '&:hover': {
                      color: '#25d366',
                      borderColor: '#25d366',
                      backgroundColor: 'rgba(37, 211, 102, 0.1)',
                    },
                  }}
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: '#cbd5e1',
                    border: '1px solid #475569',
                    '&:hover': {
                      color: '#0088cc',
                      borderColor: '#0088cc',
                      backgroundColor: 'rgba(0, 136, 204, 0.1)',
                    },
                  }}
                  aria-label="Telegram"
                >
                  <FaTelegram />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#475569' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
            &copy; {currentYear} Ecogram. All rights reserved.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              Version 1.0.0
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              |
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
              Made with ❤️ by Ecogram Team
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
