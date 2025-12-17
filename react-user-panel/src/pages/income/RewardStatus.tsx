import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const RewardStatus: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Reward Status
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your performance rewards and achievements
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Reward Status Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will display all your performance rewards and special incentives.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RewardStatus;
