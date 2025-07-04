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
  Paper,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  VerifiedUser,
  Email,
  Business,
  CheckCircle,
  Tag
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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



  const handleInternalVerification = () => {
    window.open('https://trustcheck.oa.orchanger.com', '_blank');
  };

  const handleHashVerification = () => {
    enqueueSnackbar(
      'HASH 验签功能正在开发中，请移步其他验证方式',
      {
        variant: 'warning',
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center'
        }
      }
    );
  };

  const verificationOptions = [
    {
      title: '数字签名验签',
      description: '适用于 2025年5月1日 及之后签发的电子 PDF',
      icon: <VerifiedUser sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      path: '/certcheck',
      color: 'primary',
      isNew: true
    },
    {
      title: 'HASH 验签',
      description: '适用于 2025年5月1日 及之后签发的电子文件',
      icon: <Tag sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      action: handleHashVerification,
      color: 'success',
      isNew: true,
      buttonText: '开始验证'
    },
    {
      title: '邮件查询验签',
      description: '适用于所有 电子文件/扫描件/纸质文件',
      icon: <Email sx={{ fontSize: 40, color: theme.palette.warning.main }} />,
      action: handleEmailContact,
      color: 'warning',
      isLegacy: true
    },
    {
      title: '内部验证',
      description: '仅供 Orchanger 员工使用，需登录',
      icon: <Business sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      action: handleInternalVerification,
      color: 'secondary',
      buttonText: '前往OA验证'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 导航栏 */}
      <Header />

      {/* 主要内容 */}
      <Container 
        maxWidth={false} 
        sx={{ 
          py: 4, 
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          flex: 1
        }}
      >
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
            <Typography variant="h4" component="h1" gutterBottom>
              欢迎使用 Orchanger 验签平台
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              帮助确认文件是否为 组织/部门/员工 签发，确保文件真实性和完整性。
            </Typography>
          </Paper>

          {/* 重要提示 */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>温馨提示：</strong>
              请根据文件签发日期及类型选择合适的验证方式。2025年1月起，我们启用了新的验证系统。
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
                      新版本 & 秒出结果
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
                      7个工作日
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
                      onClick={option.action || (() => {
                        if (option.path.startsWith('/')) {
                          navigate(option.path);
                        } else {
                          window.location.href = option.path;
                        }
                      })}
                      sx={{
                        mx: 2,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {option.buttonText || (option.action ? '联系我们' : '开始验证')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Footer - 保持全宽 */}
      <Footer />
    </Box>
  );
};

export default LandingPage; 