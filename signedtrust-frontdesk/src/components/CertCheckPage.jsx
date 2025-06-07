import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Grid2 as Grid,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  CloudUpload,
  Home,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Description
} from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import verifyPDF from '@ninja-labs/verify-pdf'

const CertCheckPage = () => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isDragging, setIsDragging] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        handleFileVerification(file)
      } else {
        enqueueSnackbar('请选择PDF文件', { variant: 'error' })
      }
    }
  }, [enqueueSnackbar])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type === 'application/pdf') {
        handleFileVerification(file)
      } else {
        enqueueSnackbar('请选择PDF文件', { variant: 'error' })
      }
    }
  }, [enqueueSnackbar])

  const handleFileVerification = useCallback(async (file) => {
    setIsVerifying(true)
    setFileName(file.name)
    setVerificationResult(null)

    try {
      const reader = new FileReader()
      reader.onload = function() {
        try {
          const result = verifyPDF(reader.result)
          setVerificationResult(result)
          
          if (result.verified) {
            enqueueSnackbar('PDF签名验证成功', { variant: 'success' })
          } else {
            enqueueSnackbar('PDF签名验证失败', { variant: 'error' })
          }
        } catch (error) {
          console.error('验证失败:', error)
          enqueueSnackbar('文件验证失败: ' + error.message, { variant: 'error' })
        } finally {
          setIsVerifying(false)
        }
      }
      reader.onerror = function(error) {
        console.error('文件读取失败:', error)
        enqueueSnackbar('文件读取失败', { variant: 'error' })
        setIsVerifying(false)
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('处理文件失败:', error)
      enqueueSnackbar('处理文件失败: ' + error.message, { variant: 'error' })
      setIsVerifying(false)
    }
  }, [enqueueSnackbar])

  const getStatusIcon = (status) => {
    if (status) {
      return <CheckCircle color="success" />
    } else {
      return <Cancel color="error" />
    }
  }

  const getStatusText = (status) => {
    return status ? '有效' : '无效'
  }

  const renderVerificationResult = () => {
    if (!verificationResult) return null

    return (
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" />
            验证结果
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              文件名: {fileName}
            </Typography>
          </Box>

          {/* 文件篡改检查 - 单独突出显示 */}
          <Alert 
            severity={verificationResult.integrity ? 'success' : 'error'}
            icon={verificationResult.integrity ? <CheckCircle color="success" /> : <Warning color="error" />}
            sx={{ mb: 3, fontSize: '1.1rem' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              文件篡改验证: {verificationResult.integrity ? '✓ 文件未被篡改' : '✗ 文件可能已被篡改'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {verificationResult.integrity 
                ? '文档内容与签名时保持一致，未发现修改痕迹' 
                : '检测到文档内容可能在签名后被修改，请谨慎处理'}
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
              <Alert 
                severity={verificationResult.verified ? 'success' : 'error'}
                icon={getStatusIcon(verificationResult.verified)}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  整体验证状态: {getStatusText(verificationResult.verified)}
                </Typography>
              </Alert>
            </Grid>
            
            <Grid xs={12} sm={6}>
              <Alert 
                severity={verificationResult.authenticity ? 'success' : 'error'}
                icon={getStatusIcon(verificationResult.authenticity)}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  证书真实性: {getStatusText(verificationResult.authenticity)}
                </Typography>
              </Alert>
            </Grid>
            
            <Grid xs={12} sm={6}>
              <Alert 
                severity={verificationResult.integrity ? 'success' : 'error'}
                icon={getStatusIcon(verificationResult.integrity)}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  文件篡改检查: {verificationResult.integrity ? '未被篡改' : '可能被篡改'}
                </Typography>
              </Alert>
            </Grid>
            
            <Grid xs={12} sm={6}>
              <Alert 
                severity={verificationResult.expired ? 'error' : 'success'}
                icon={verificationResult.expired ? <Warning color="error" /> : <CheckCircle color="success" />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  证书状态: {verificationResult.expired ? '已过期' : '有效期内'}
                </Typography>
              </Alert>
            </Grid>
          </Grid>

          {verificationResult.signatures && verificationResult.signatures.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                签名详情 ({verificationResult.signatures.length}个签名)
              </Typography>
              
              {verificationResult.signatures.map((signature, index) => (
                <Card key={index} variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      签名 #{index + 1}
                    </Typography>
                    
                    {signature.signatureMeta && (
                      <Box sx={{ mb: 2 }}>
                        {signature.signatureMeta.name && (
                          <Chip label={`签名者: ${signature.signatureMeta.name}`} sx={{ mr: 1, mb: 1 }} />
                        )}
                        {signature.signatureMeta.reason && (
                          <Chip label={`原因: ${signature.signatureMeta.reason}`} sx={{ mr: 1, mb: 1 }} />
                        )}
                        {signature.signatureMeta.location && (
                          <Chip label={`位置: ${signature.signatureMeta.location}`} sx={{ mr: 1, mb: 1 }} />
                        )}
                        {signature.signatureMeta.contactInfo && (
                          <Chip label={`联系信息: ${signature.signatureMeta.contactInfo}`} sx={{ mr: 1, mb: 1 }} />
                        )}
                      </Box>
                    )}
                    
                    {signature.certificates && signature.certificates.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          证书信息:
                        </Typography>
                        {signature.certificates.map((cert, certIndex) => (
                          <Box key={certIndex} sx={{ ml: 2, mb: 1 }}>
                            <Typography variant="body2">
                              <strong>颁发给:</strong> {cert.issuedTo?.commonName || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              <strong>颁发者:</strong> {cert.issuedBy?.commonName || 'N/A'}
                            </Typography>
                            {cert.validityPeriod && (
                              <Typography variant="body2">
                                <strong>有效期:</strong> {cert.validityPeriod.notBefore} 至 {cert.validityPeriod.notAfter}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* 顶部导航栏 */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="返回首页"
          >
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 1 }}>
            数字签名验证
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 页面标题和说明 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" gutterBottom>
            PDF数字签名验证
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            上传您的PDF文件进行数字签名验证。适用于2025年1月1日及之后签发的文件。
          </Typography>
        </Box>

        {/* 文件上传区域 */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: 'center',
            border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.grey[300]}`,
            bgcolor: isDragging ? 'primary.50' : 'background.paper',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'primary.50'
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          {isVerifying ? (
            <Box>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                正在验证中...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                请稍候，正在验证PDF文件的数字签名
              </Typography>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                拖拽PDF文件到此处或点击选择文件
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                支持的文件格式：PDF
              </Typography>
              <Button variant="contained" startIcon={<CloudUpload />} sx={{ mt: 2 }}>
                选择文件
              </Button>
            </Box>
          )}
        </Paper>

        {/* 使用说明 */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            <Info sx={{ verticalAlign: 'middle', mr: 1 }} />
            使用说明
          </Typography>
          <Typography variant="body2">
            • 请确保上传的PDF文件包含数字签名<br/>
            • 验证过程将检查证书的真实性、文档完整性和证书有效期<br/>
            • 此服务适用于2025年1月1日及之后签发的文件
          </Typography>
        </Alert>

        {/* 验证结果 */}
        {renderVerificationResult()}
      </Container>
    </Box>
  )
}

export default CertCheckPage 