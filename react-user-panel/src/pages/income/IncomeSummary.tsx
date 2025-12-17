import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const IncomeSummary: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Income Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Comprehensive overview of all your income sources
      </Typography>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Income Summary Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This page will show a complete breakdown of all your income types with totals and statistics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default IncomeSummary;
