/**
 * 格式化签名时间
 * @param {string} timeString - 时间字符串
 * @returns {string} 格式化后的时间
 */
export const formatSigningTime = (timeString) => {
  if (!timeString) return '未知';
  try {
    return new Date(timeString).toLocaleString('zh-CN');
  } catch {
    return timeString;
  }
};

/**
 * 检查签名时间状态
 * @param {string} timeString - 时间字符串
 * @returns {string} 时间状态：'valid' | 'warning' | 'invalid'
 */
export const checkSigningTimeStatus = (timeString) => {
  if (!timeString) return 'invalid';
  try {
    const signingTime = new Date(timeString);
    const now = new Date();
    // 检查签名时间是否在未来（无效）
    if (signingTime > now) return 'invalid';
    // 检查签名时间是否过于久远（超过10年认为警告）
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (signingTime < tenYearsAgo) return 'warning';
    return 'valid';
  } catch {
    return 'invalid';
  }
};

/**
 * 格式化覆盖范围文本
 * @param {string} coverage - 覆盖范围
 * @returns {string} 格式化后的覆盖范围文本
 */
export const formatCoverageText = (coverage) => {
  if (coverage === 'SignatureCoverageLevel.ENTIRE_FILE') return '整个文件';
  if (coverage === 'SignatureCoverageLevel.ENTIRE_REVISION') return '整个修订版本';
  if (coverage === 'SignatureCoverageLevel.RECENT_CHANGES') return '最近更改';
  return coverage || '未知';
};

/**
 * 获取签名状态文本
 * @param {Object} signature - 签名对象
 * @returns {string} 状态文本
 */
export const getSignatureStatusText = (signature) => {
  if (signature.valid && signature.intact && signature.is_trusted_cert) {
    return '可信签名';
  } else if (signature.valid && signature.intact) {
    return '有效签名（证书未在可信列表）';
  } else {
    return '无效签名';
  }
};

/**
 * 获取签名状态颜色
 * @param {Object} signature - 签名对象
 * @returns {string} 颜色类型
 */
export const getSignatureStatusColor = (signature) => {
  if (signature.valid && signature.intact && signature.is_trusted_cert) {
    return 'success';
  } else if (signature.valid && signature.intact) {
    return 'warning';
  } else {
    return 'error';
  }
};

/**
 * 解析证书subject字符串为key-value对象
 * @param {string} subjectString - 证书subject字符串
 * @returns {Object} 解析后的key-value对象
 */
export const parseSubject = (subjectString) => {
  if (!subjectString) return {};
  
  const result = {};
  // 使用正则表达式匹配 key: value 模式，支持包含逗号的值
  const regex = /([^:,]+):\s*([^,]*?)(?=,\s*[^:,]+:|$)/g;
  let match;
  
  while ((match = regex.exec(subjectString)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim();
    if (key && value) {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * 获取subject字段的显示标签
 * @param {string} key - subject字段key
 * @returns {string} 显示标签
 */
export const getSubjectFieldLabel = (key) => {
  const labelMap = {
    'Common Name': '通用名称',
    'Organization': '组织',
    'Email Address': '邮箱地址',
    'Country': '国家',
    'State': '省/州',
    'City': '城市',
    'Locality': '地区',
    'Organizational Unit': '组织单位',
    'Street': '街道地址'
  };
  
  return labelMap[key] || key;
};

/**
 * 检查单个签名是否完全通过验证
 * @param {Object} signature - 签名对象
 * @returns {boolean} 是否完全通过验证
 */
export const isSignatureFullyValid = (signature) => {
  const isTrusted = signature.is_trusted_cert === true;
  const isValid = signature.valid === true && signature.intact === true;
  const isValidCoverage = signature.coverage === "SignatureCoverageLevel.ENTIRE_FILE" || 
                          signature.coverage === "SignatureCoverageLevel.ENTIRE_REVISION";
  return isTrusted && isValid && isValidCoverage;
}; 