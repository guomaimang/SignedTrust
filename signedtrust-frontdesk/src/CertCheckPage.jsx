import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button
} from '@mui/material';
import {
  ArrowBack
} from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUploader from './components/FileUploader';
import VerificationResult from './components/VerificationResult';
import CertVerificationService from './services/certVerificationService';

const CertCheckPage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileUpload = async (file) => {
    // 验证文件类型
    if (!CertVerificationService.validateFileType(file)) {
      enqueueSnackbar('请上传PDF文件', { variant: 'error' });
      return;
    }

    // 验证文件大小 (15MB)
    if (!CertVerificationService.validateFileSize(file, 15)) {
      enqueueSnackbar('文件大小不能超过15MB', { variant: 'error' });
      return;
    }

    setIsUploading(true);
    setVerificationResult(null);

    try {
      const result = await CertVerificationService.verifySignature(file);
      setVerificationResult(result);
      
      if (result.error) {
        enqueueSnackbar(result.error, { variant: 'error' });
      } else {
        enqueueSnackbar('验证完成', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      enqueueSnackbar('上传文件失败，请重试', { variant: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

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
      <Header />

      <Container 
        maxWidth={false} 
        sx={{ 
          py: 4, 
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          flex: 1
        }}
      >
        <Box sx={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* 返回按钮和标题 */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/"
              startIcon={<ArrowBack />}
              variant="outlined"
              color="primary"
            >
              返回首页
            </Button>
            <Typography variant="h4" component="h1">
              数字签名验签
            </Typography>
          </Box>

          {/* 说明信息 */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>说明：</strong>
              适用于 2025年5月1日 及之后签发的电子 PDF 文件。
            </Typography>
          </Alert>

          {/* 文件上传区域 */}
          <FileUploader 
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />

          {/* 验证结果 */}
          <VerificationResult verificationResult={verificationResult} />
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default CertCheckPage; 