import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * BlankLayout Props
 */
interface BlankLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  minHeight?: string | number;
  padding?: number | string;
}

/**
 * BlankLayout Component
 *
 * Minimal layout with just children content.
 * No header, sidebar, or footer.
 * Useful for:
 * - Full-screen pages
 * - Landing pages
 * - Error pages (404, 500)
 * - Maintenance pages
 * - Print views
 */
const BlankLayout: React.FC<BlankLayoutProps> = ({
  children,
  backgroundColor,
  minHeight = '100vh',
  padding = 0,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: backgroundColor || theme.palette.background.default,
        p: padding,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </motion.div>
    </Box>
  );
};

export default BlankLayout;
