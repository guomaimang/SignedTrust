import React, { useState, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
  useTheme
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const FileUploader = ({ onFileUpload, isUploading }) => {
  const theme = useTheme();
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mb: 4,
        border: dragOver ? `2px dashed ${theme.palette.primary.main}` : '2px dashed #ccc',
        backgroundColor: dragOver ? theme.palette.primary.light + '10' : 'white',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        position: 'relative'
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
      
      <Box sx={{ textAlign: 'center' }}>
        <CloudUpload sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          拖拽 PDF 文件到此处或点击上传
        </Typography>
        <Typography variant="body2" color="text.secondary">
          支持最大 15MB 的 PDF 文件
        </Typography>
      </Box>

      {isUploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            正在验证签名...
          </Typography>
          <LinearProgress />
        </Box>
      )}
    </Paper>
  );
};

export default FileUploader; 