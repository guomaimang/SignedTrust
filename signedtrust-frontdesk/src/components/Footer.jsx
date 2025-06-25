import React from 'react';
import {
  Paper,
  Typography,
  useTheme
} from '@mui/material';

const Footer = () => {
  const theme = useTheme();

  const handleOrchangerClick = () => {
    window.open('https://orchanger.com', '_blank');
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        textAlign: 'center',
        backgroundColor: theme.palette.grey[100],
        width: '100%',
        mt: 'auto' // 这确保footer被推到底部
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} {' '}
        <span 
          onClick={handleOrchangerClick}
          style={{
            cursor: 'pointer',
            color: theme.palette.primary.main,
            textDecoration: 'underline'
          }}
        >
          Orchanger
        </span>
        . 版权所有 | 如有疑问，请联系 service@orchanger.com
      </Typography>
    </Paper>
  );
};

export default Footer; 