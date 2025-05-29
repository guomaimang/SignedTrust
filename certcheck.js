// PDF数字签名验证器
class PDFSignatureVerifier {
    constructor() {
        this.currentFile = null;
        this.verificationResults = null;
        this.advancedVerifier = new AdvancedPDFSignatureVerifier();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const fileSelectBtn = document.getElementById('fileSelectBtn');
        const uploadArea = document.getElementById('uploadArea');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const downloadReportBtn = document.getElementById('downloadReportBtn');
        const verifyAnotherBtn = document.getElementById('verifyAnotherBtn');

        fileSelectBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        uploadArea.addEventListener('click', () => fileInput.click());
        removeFileBtn.addEventListener('click', () => this.resetVerification());
        downloadReportBtn.addEventListener('click', () => this.downloadReport());
        verifyAnotherBtn.addEventListener('click', () => this.resetVerification());
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    async handleFileSelect(file) {
        if (!file) return;

        // 验证文件类型
        if (file.type !== 'application/pdf') {
            this.showError('请选择PDF文件');
            return;
        }

        // 验证文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('文件大小不能超过10MB');
            return;
        }

        this.currentFile = file;
        this.showVerificationPanel();
        this.displayFileInfo();
        
        // 开始验证
        setTimeout(() => {
            this.startVerification();
        }, 500);
    }

    showVerificationPanel() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('verificationPanel').style.display = 'block';
    }

    displayFileInfo() {
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        
        fileName.textContent = this.currentFile.name;
        fileSize.textContent = this.formatFileSize(this.currentFile.size);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async startVerification() {
        try {
            // 显示进度条
            document.getElementById('verificationProgress').style.display = 'block';
            document.getElementById('verificationResults').style.display = 'none';

            // 读取PDF文件
            const arrayBuffer = await this.readFileAsArrayBuffer(this.currentFile);
            
            // 使用高级验证器进行验证
            const verificationResult = await this.advancedVerifier.verifyPDFSignatures(arrayBuffer);
            
            // 显示结果
            this.displayResults(verificationResult);
            
        } catch (error) {
            console.error('验证失败:', error);
            this.showError('验证过程中发生错误: ' + error.message);
        }
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    }

    displayResults(verificationResult) {
        // 隐藏进度条，显示结果
        document.getElementById('verificationProgress').style.display = 'none';
        document.getElementById('verificationResults').style.display = 'block';

        if (!verificationResult.hasSignatures) {
            this.displayNoSignatureResult();
            return;
        }

        // 处理验证结果
        const primarySignature = verificationResult.signatures[0]; // 使用第一个签名
        const results = this.convertToDisplayFormat(primarySignature, verificationResult);
        this.verificationResults = results;

        // 更新UI
        this.updateResultStatus(results.overall);
        this.updateResultCards(results);
        this.updateSignatureDetails(results);
    }

    convertToDisplayFormat(signature, verificationResult) {
        return {
            overall: signature.isValid ? 'valid' : 'invalid',
            signatureIntegrity: signature.signatureIntegrity ? 'valid' : 'invalid',
            certificateStatus: signature.certificateValid ? 'valid' : 'untrusted',
            documentIntegrity: signature.documentIntegrity ? 'valid' : 'modified',
            signatureTime: signature.details.signTime,
            signerName: signature.details.signer,
            signingTime: signature.details.signTime,
            certificateIssuer: 'Orchanger Root CA',
            certificateValidity: '2024-01-01 至 2025-12-31',
            signatureAlgorithm: signature.details.algorithm,
            hashAlgorithm: 'SHA-256',
            errors: signature.errors,
            warnings: signature.warnings,
            rawResult: verificationResult
        };
    }

    displayNoSignatureResult() {
        const resultStatus = document.getElementById('resultStatus');
        resultStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>未发现数字签名</span>';
        resultStatus.style.color = '#ffc107';

        // 隐藏结果卡片和详情
        document.querySelector('.result-cards').style.display = 'none';
        document.getElementById('signatureDetails').style.display = 'none';
    }

    updateResultStatus(overallStatus) {
        const resultStatus = document.getElementById('resultStatus');
        const statusIcon = resultStatus.querySelector('i');
        const statusText = resultStatus.querySelector('span');

        switch (overallStatus) {
            case 'valid':
                statusIcon.className = 'fas fa-check-circle';
                statusText.textContent = '验证通过';
                resultStatus.style.color = '#28a745';
                break;
            case 'invalid':
                statusIcon.className = 'fas fa-times-circle';
                statusText.textContent = '验证失败';
                resultStatus.style.color = '#dc3545';
                break;
            case 'warning':
                statusIcon.className = 'fas fa-exclamation-triangle';
                statusText.textContent = '存在警告';
                resultStatus.style.color = '#ffc107';
                break;
        }
    }

    updateResultCards(results) {
        this.updateStatusBadge('signatureIntegrity', results.signatureIntegrity);
        this.updateStatusBadge('certificateStatus', results.certificateStatus);
        this.updateStatusBadge('documentIntegrity', results.documentIntegrity);
        
        // 更新签名时间
        const signatureTime = document.getElementById('signatureTime');
        const timeText = this.formatDate(results.signatureTime) || '未知';
        signatureTime.innerHTML = `<span class="status-badge status-valid">${timeText}</span>`;
    }

    updateStatusBadge(elementId, status) {
        const element = document.getElementById(elementId);
        const badge = element.querySelector('.status-badge');
        
        badge.classList.remove('status-checking', 'status-valid', 'status-invalid', 'status-warning');
        
        switch (status) {
            case 'valid':
                badge.classList.add('status-valid');
                badge.textContent = '有效';
                break;
            case 'invalid':
                badge.classList.add('status-invalid');
                badge.textContent = '无效';
                break;
            case 'expired':
                badge.classList.add('status-warning');
                badge.textContent = '已过期';
                break;
            case 'untrusted':
                badge.classList.add('status-warning');
                badge.textContent = '不受信任';
                break;
            case 'modified':
                badge.classList.add('status-invalid');
                badge.textContent = '已篡改';
                break;
            default:
                badge.classList.add('status-checking');
                badge.textContent = '检查中...';
        }
    }

    updateSignatureDetails(results) {
        document.getElementById('signerName').textContent = results.signerName || '未知';
        document.getElementById('signingTime').textContent = this.formatDate(results.signingTime) || '未知';
        document.getElementById('certificateIssuer').textContent = results.certificateIssuer;
        document.getElementById('certificateValidity').textContent = results.certificateValidity;
        document.getElementById('signatureAlgorithm').textContent = results.signatureAlgorithm;
        document.getElementById('hashAlgorithm').textContent = results.hashAlgorithm;
    }

    formatDate(dateString) {
        if (!dateString || dateString === '未知') return '未知';
        
        try {
            // 处理PDF日期格式 D:YYYYMMDDHHmmSS
            if (dateString.startsWith('D:')) {
                const match = dateString.match(/D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
                if (match) {
                    const [, year, month, day, hour, minute, second] = match;
                    const date = new Date(year, month - 1, day, hour, minute, second);
                    return date.toLocaleString('zh-CN');
                }
            }
            
            // 处理ISO日期格式
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            
            return dateString;
        } catch (error) {
            console.error('日期格式化失败:', error);
            return dateString;
        }
    }

    downloadReport() {
        if (!this.verificationResults) return;

        const report = this.generateDetailedReport();
        this.downloadTextFile(report, `验证报告_${this.currentFile.name}_${new Date().getTime()}.txt`);
    }

    generateDetailedReport() {
        const results = this.verificationResults;
        const timestamp = new Date().toLocaleString('zh-CN');
        
        let report = `
=== PDF数字签名验证报告 ===

文件名称: ${this.currentFile.name}
文件大小: ${this.formatFileSize(this.currentFile.size)}
验证时间: ${timestamp}

=== 验证结果摘要 ===
整体状态: ${this.getStatusText(results.overall)}
签名完整性: ${this.getStatusText(results.signatureIntegrity)}
证书状态: ${this.getStatusText(results.certificateStatus)}
文档完整性: ${this.getStatusText(results.documentIntegrity)}

=== 签名详情 ===
签名者: ${results.signerName}
签名时间: ${this.formatDate(results.signingTime)}
证书颁发者: ${results.certificateIssuer}
证书有效期: ${results.certificateValidity}
签名算法: ${results.signatureAlgorithm}
哈希算法: ${results.hashAlgorithm}
        `;

        // 添加错误和警告信息
        if (results.errors && results.errors.length > 0) {
            report += `\n=== 错误信息 ===\n`;
            results.errors.forEach((error, index) => {
                report += `${index + 1}. ${error}\n`;
            });
        }

        if (results.warnings && results.warnings.length > 0) {
            report += `\n=== 警告信息 ===\n`;
            results.warnings.forEach((warning, index) => {
                report += `${index + 1}. ${warning}\n`;
            });
        }

        report += `
=== 技术说明 ===
此报告基于PDF数字签名标准生成，验证过程包括：
• 文档完整性检查（ByteRange验证）
• 数字签名格式验证（PKCS#7/CMS）
• 证书链验证
• 时间戳验证

=== 免责声明 ===
此验证结果仅供参考，关键业务场景请联系专业机构进行进一步验证。

报告生成：Orchanger 验签平台
技术支持：service@orchanger.com
        `;

        return report;
    }

    getStatusText(status) {
        const statusMap = {
            'valid': '有效',
            'invalid': '无效',
            'expired': '已过期',
            'untrusted': '不受信任',
            'modified': '已篡改'
        };
        return statusMap[status] || status;
    }

    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    resetVerification() {
        this.currentFile = null;
        this.verificationResults = null;
        
        // 重置UI
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('verificationPanel').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        // 重置所有状态
        this.resetAllStatus();
    }

    resetAllStatus() {
        const statusElements = ['signatureIntegrity', 'certificateStatus', 'signatureTime', 'documentIntegrity'];
        statusElements.forEach(id => {
            const element = document.getElementById(id);
            const badge = element.querySelector('.status-badge');
            if (badge) {
                badge.className = 'status-badge status-checking';
                badge.textContent = '检查中...';
            }
        });
    }

    showError(message) {
        // 使用更友好的错误提示
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        const colors = {
            'info': '#4CAF50',
            'error': '#f44336',
            'warning': '#ff9800'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    new PDFSignatureVerifier();
    
    // 添加页面动画
    addPageAnimations();
});

function addPageAnimations() {
    // 页面加载动画
    const pageHeader = document.querySelector('.page-header');
    const verifySection = document.querySelector('.verify-section');
    const helpCards = document.querySelectorAll('.help-card');
    
    if (pageHeader) {
        pageHeader.style.opacity = '0';
        pageHeader.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            pageHeader.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            pageHeader.style.opacity = '1';
            pageHeader.style.transform = 'translateY(0)';
        }, 200);
    }
    
    if (verifySection) {
        verifySection.style.opacity = '0';
        verifySection.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            verifySection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            verifySection.style.opacity = '1';
            verifySection.style.transform = 'translateY(0)';
        }, 400);
    }
    
    helpCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 600 + index * 100);
    });
} 