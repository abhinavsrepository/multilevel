import React from 'react';
import { Box } from '@mui/material';
import AppRoutes from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <AppRoutes />
    </Box>
  );
};

export default App;
