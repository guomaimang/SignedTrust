import React from 'react';
import {
  Paper,
  Typography,
  useTheme
} from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        textAlign: 'center',
        backgroundColor: theme.palette.grey[100]
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Orchanger. 版权所有 | 如有疑问，请联系 service@orchanger.com
      </Typography>
    </Paper>
  );
};

export default Footer; 