import axios from 'axios';

/**
 * 证书验证服务
 */
class CertVerificationService {
  /**
   * 验证PDF文件的数字签名
   * @param {File} file - 要验证的PDF文件
   * @returns {Promise<Object>} 验证结果
   */
  static async verifySignature(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('/signcheck/verify-signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * 验证文件类型是否为PDF
   * @param {File} file - 要验证的文件
   * @returns {boolean} 是否为PDF文件
   */
  static validateFileType(file) {
    return file.type === 'application/pdf';
  }

  /**
   * 验证文件大小
   * @param {File} file - 要验证的文件
   * @param {number} maxSizeMB - 最大文件大小（MB）
   * @returns {boolean} 文件大小是否合规
   */
  static validateFileSize(file, maxSizeMB = 15) {
    return file.size <= maxSizeMB * 1024 * 1024;
  }
}

export default CertVerificationService; 