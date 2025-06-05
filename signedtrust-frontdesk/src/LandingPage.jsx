import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  VerifiedUser,
  Security,
  Email,
  Business,
  Home,
  CheckCircle,
  Tag
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleEmailContact = () => {
    enqueueSnackbar(
      '请联系邮箱: service@orchanger.com',
      {
        variant: 'info',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      }
    );
  };

  const handleHomeNavigation = () => {
    window.open('https://orchanger.com', '_blank');
  };

  const handleInternalVerification = () => {
    window.open('https://signcheck.oa.orchanger.com', '_blank');
  };

  const verificationOptions = [
    {
      title: '数字签名验签',
      description: '适用于 2025年1月1日 及之后签发的文件',
      icon: <VerifiedUser sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/certcheck.html',
      color: 'primary',
      isNew: true
    },
    {
      title: 'HASH 验签',
      description: '文档完整性哈希值验证',
      icon: <Tag sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      path: '/hashcheck.html',
      color: 'success'
    },
    {
      title: '邮件查询验签',
      description: '适用于 2024年12月31日 及之前签发的文件',
      icon: <Email sx={{ fontSize: 40, color: theme.palette.warning.main }} />,
      action: handleEmailContact,
      color: 'warning',
      isLegacy: true
    },
    {
      title: '内部文件验证',
      description: '企业内部专用验证系统',
      icon: <Business sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      action: handleInternalVerification,
      color: 'secondary'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', width: '100%' }}>
      {/* 导航栏 */}
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

      {/* 主要内容 */}
      <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
        <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* 欢迎区域 */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <CheckCircle sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom>
              欢迎使用 Orchanger 验签平台
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              选择适合您的验证方式，确保文件的完整性和真实性
            </Typography>
          </Paper>

          {/* 重要提示 */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>温馨提示：</strong>
              请根据您的文件签发日期选择合适的验证方式。2025年1月1日起，我们启用了新的数字签名验证系统。
            </Typography>
          </Alert>

          {/* 验证选项 */}
          <Grid container spacing={3}>
            {verificationOptions.map((option, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Card
                  elevation={4}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8]
                    },
                    position: 'relative'
                  }}
                >
                  {option.isNew && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: theme.palette.success.main,
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      新版本
                    </Box>
                  )}
                  {option.isLegacy && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: theme.palette.grey[500],
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      旧版本
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {option.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h2">
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      variant="contained"
                      color={option.color}
                      size="large"
                      fullWidth={isMobile}
                      onClick={option.action || (() => window.location.href = option.path)}
                      sx={{
                        mx: 2,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {option.action ? '联系我们' : '开始验证'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Footer - 保持全宽 */}
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
    </Box>
  );
};

export default LandingPage; 