import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  Paper
} from '@mui/material';
import {
  VerifiedUser,
  Info,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import SignatureDetails from './SignatureDetails';

const VerificationResult = ({ verificationResult }) => {
  if (!verificationResult) return null;

  if (verificationResult.error) {
    return (
      <Card elevation={4} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUser color="primary" />
            验证结果
          </Typography>
          
          {/* 总体结论显示无法验证 */}
          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              mb: 3,
              backgroundColor: theme => theme.palette.error.light + '20'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Cancel 
                sx={{ 
                  fontSize: 32,
                  color: theme => theme.palette.error.main 
                }} 
              />
              <Typography variant="h5" fontWeight="bold">
                无法验证
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: theme => theme.palette.grey[50], borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                建议尝试使用其他验证方式或联系 service@orchanger.com 进行人工验证。
              </Typography>
            </Box>
          </Paper>

          {/* 折叠的错误详情 */}
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>错误详情：</strong>
            </Typography>
            <Typography variant="body2">
              {verificationResult.error}
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // 计算总体验证结果
  const calculateOverallResult = () => {
    if (!verificationResult.has_signature) {
      return { status: 'no_signature', text: '未发现签名', color: 'error', icon: Cancel };
    }

    if (!verificationResult.signatures || verificationResult.signatures.length === 0) {
      return { status: 'no_signature', text: '未发现签名', color: 'error', icon: Cancel };
    }

    // 检查是否至少有一个签名是ENTIRE_FILE覆盖
    const hasEntireFileCoverage = verificationResult.signatures.some(signature => 
      signature.coverage === "SignatureCoverageLevel.ENTIRE_FILE"
    );

    // 检查是否所有签名都通过验证
    const allSignaturesValid = verificationResult.signatures.every(signature => {
      const isTrusted = signature.is_trusted_cert === true;
      const isValid = signature.valid === true && signature.intact === true;
      const isValidCoverage = signature.coverage === "SignatureCoverageLevel.ENTIRE_FILE" || 
                              signature.coverage === "SignatureCoverageLevel.ENTIRE_REVISION";
      return isTrusted && isValid && isValidCoverage;
    });

    // 只有所有签名都PASS且至少有一个ENTIRE_FILE覆盖，才算验签通过
    if (allSignaturesValid && hasEntireFileCoverage) {
      return { status: 'verified', text: '验签通过', color: 'success', icon: CheckCircle };
    } else {
      return { status: 'failed', text: '无法验证', color: 'error', icon: Cancel };
    }
  };

  const overallResult = calculateOverallResult();
  const IconComponent = overallResult.icon;

  return (
    <Card elevation={4} sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUser color="primary" />
          验证结果
        </Typography>

        {/* 总体结论 */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 3, 
            mb: 3,
            backgroundColor: theme => 
              overallResult.color === 'success' 
                ? theme.palette.success.light + '20'
                : overallResult.color === 'warning'
                ? theme.palette.warning.light + '20'
                : theme.palette.error.light + '20'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconComponent 
              sx={{ 
                fontSize: 32,
                color: theme => theme.palette[overallResult.color].main 
              }} 
            />
            <Typography variant="h5" fontWeight="bold">
              {overallResult.text}
            </Typography>
          </Box>
          
          {/* 签名检测状态 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body1" component="span">
              <strong>签名检测：</strong>
              {verificationResult.has_signature ? (
                `发现 ${verificationResult.signature_count} 个签名`
              ) : (
                '未发现签名'
              )}
            </Typography>
          </Box>
          
          {/* 无法验证时的引导提示 */}
          {overallResult.status === 'failed' && (
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: theme => theme.palette.grey[50], borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                建议尝试使用其他验证方式或联系 service@orchanger.com 进行人工验证。
              </Typography>
            </Box>
          )}
        </Paper>

        {/* 签名详情列表 */}
        {verificationResult.signatures && verificationResult.signatures.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              签名详情
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {verificationResult.signatures.map((signature, index) => (
                <SignatureDetails 
                  key={index} 
                  signature={signature} 
                  index={index}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 说明信息 */}
        <Alert severity="info">
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>验证说明：</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • <strong>验签通过：</strong>所有签名均有效、文档完整、证书可信且全覆盖<br/>
              • <strong>无法验证：</strong>存在无效签名、文档被修改、证书不可信或覆盖不完整<br/>
              • <strong>未发现签名：</strong>文档未包含数字签名
            </Typography>
          </Box>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default VerificationResult; 