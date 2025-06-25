import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  ExpandMore
} from '@mui/icons-material';
import {
  formatSigningTime,
  parseSubject,
  getSubjectFieldLabel,
  isSignatureFullyValid
} from '../utils/certificateUtils';

const SignatureDetails = ({ signature, index }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // 计算三个关键验证项的状态
  const trustStatus = signature.is_trusted_cert === true;
  const validityStatus = signature.valid === true && signature.intact === true;
  const coverageStatus = signature.coverage === "SignatureCoverageLevel.ENTIRE_FILE" || 
                        signature.coverage === "SignatureCoverageLevel.ENTIRE_REVISION";
  
  // 计算总体状态 - 需要考虑新的覆盖规则
  const overallValid = trustStatus && validityStatus && coverageStatus;

  // 状态显示组件
  const StatusIndicator = ({ isValid, label, description, color }) => {
    const statusColor = color || (isValid ? theme.palette.success.main : theme.palette.error.main);
    const icon = isValid ? <CheckCircle /> : <Cancel />;
    const bgColor = color ? color + '20' : (isValid 
      ? theme.palette.success.light + '20' 
      : theme.palette.error.light + '20');

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        p: 2,
        borderRadius: 1,
        backgroundColor: bgColor,
        border: `1px solid ${statusColor}20`
      }}>
        {React.cloneElement(icon, { sx: { color: statusColor, fontSize: 20 } })}
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
    );
  };

  // 获取覆盖状态的显示信息
  const getCoverageDisplay = () => {
    if (signature.coverage === "SignatureCoverageLevel.ENTIRE_FILE") {
      return {
        isValid: true,
        description: '覆盖整个文件',
        color: theme.palette.success.main
      };
    } else if (signature.coverage === "SignatureCoverageLevel.ENTIRE_REVISION") {
      return {
        isValid: true,
        description: '覆盖整个修订版本',
        color: theme.palette.info.main
      };
    } else {
      return {
        isValid: false,
        description: '未完全覆盖文件',
        color: theme.palette.error.main
      };
    }
  };

  const coverageDisplay = getCoverageDisplay();

  // 解析证书subject
  const subjectData = parseSubject(signature.signing_cert_subject);

  return (
    <Accordion 
      expanded={expanded === 'panel1'} 
      onChange={handleChange('panel1')}
      sx={{ 
        borderLeft: `4px solid ${
          overallValid 
            ? theme.palette.success.main
            : theme.palette.error.main
        }`,
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ 
          backgroundColor: overallValid 
            ? theme.palette.success.light + '10'
            : theme.palette.error.light + '10'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          {overallValid ? (
            <CheckCircle sx={{ color: theme.palette.success.main }} />
          ) : (
            <Cancel sx={{ color: theme.palette.error.main }} />
          )}
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            签名 #{signature.signature_index + 1}
          </Typography>
          
          <Chip
            label={overallValid ? 'PASS' : 'FAIL'}
            color={overallValid ? 'success' : 'error'}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* 三个关键验证块 */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              验证结果
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <StatusIndicator
                  isValid={trustStatus}
                  label="证书可信性"
                  description={trustStatus ? '证书在组织可信列表中' : '证书不在组织可信列表中'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatusIndicator
                  isValid={validityStatus}
                  label="签名有效性"
                  description={validityStatus ? '签名有效且文档完整未篡改' : '签名无效或文档已修改'}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StatusIndicator
                  isValid={coverageDisplay.isValid}
                  label="签名覆盖性"
                  description={coverageDisplay.description}
                  color={coverageDisplay.color}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* 证书信息 */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              证书信息
            </Typography>
            
            {Object.keys(subjectData).length > 0 ? (
              <Grid container spacing={2}>
                {Object.entries(subjectData).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: theme.palette.grey[50], 
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.grey[200]}`
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {getSubjectFieldLabel(key)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: 'break-word' }}>
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {signature.signing_cert_subject || '证书信息不可用'}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* 详细信息 */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              详细信息
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    签名时间
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatSigningTime(signature.signing_time)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    覆盖范围
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {signature.coverage === 'SignatureCoverageLevel.ENTIRE_FILE' 
                      ? '整个文件' 
                      : signature.coverage === 'SignatureCoverageLevel.ENTIRE_REVISION'
                      ? '整个修订版本'
                      : '部分覆盖'
                    }
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    签名验证
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {signature.valid ? '有效' : '无效'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: theme.palette.grey[50], 
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    文档完整性
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {signature.intact ? '完整' : '已修改'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default SignatureDetails; 