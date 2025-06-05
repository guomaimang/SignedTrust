import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import {
  Security,
  Home
} from '@mui/icons-material';

const Header = () => {
  const handleHomeNavigation = () => {
    window.open('https://orchanger.com', '_blank');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Security sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Orchanger 验签平台
        </Typography>
        <Button
          color="inherit"
          startIcon={<Home />}
          onClick={handleHomeNavigation}
        >
          返回首页
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 