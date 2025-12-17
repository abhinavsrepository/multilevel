import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TeamLevelDownline: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Team Level Downline
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View team members organized by levels
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Team Level Downline Details Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will display your downline members organized by levels with detailed performance metrics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TeamLevelDownline;
