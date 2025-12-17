import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ROIBonus: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        ROI Bonus
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View your return on investment earnings
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          ROI Bonus Details Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will show all your ROI earnings from property investments.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ROIBonus;
