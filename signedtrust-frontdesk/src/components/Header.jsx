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

  const handleRootNavigation = () => {
    window.location.href = '/';
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Security 
          sx={{ mr: 2, cursor: 'pointer' }} 
          onClick={handleRootNavigation}
        />
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={handleRootNavigation}
        >
          验签平台
        </Typography>
        <Button
          color="inherit"
          startIcon={<Home />}
          onClick={handleHomeNavigation}
        >
          返回企业首页
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 