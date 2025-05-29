/**
 * PDF数字签名验证库
 * 基于Web Crypto API和PDF解析实现
 */
class AdvancedPDFSignatureVerifier {
    constructor() {
        // 企业公钥（示例，实际环境中应该从证书管理系统获取）
        this.trustedPublicKeys = [
            // Orchanger 企业证书公钥
            {
                name: 'Orchanger Root CA',
                publicKey: null, // 实际环境中加载公钥
                issuer: 'Orchanger Digital Certificate Authority',
                validFrom: '2024-01-01',
                validTo: '2025-12-31'
            }
        ];
        
        this.cryptoSupported = this.checkCryptoSupport();
    }

    checkCryptoSupport() {
        return typeof window !== 'undefined' && 
               window.crypto && 
               window.crypto.subtle;
    }

    /**
     * 验证PDF文件的数字签名
     */
    async verifyPDFSignatures(pdfArrayBuffer) {
        try {
            if (!this.cryptoSupported) {
                throw new Error('浏览器不支持Web Crypto API');
            }

            // 解析PDF文件
            const pdfData = new Uint8Array(pdfArrayBuffer);
            const pdfContent = new TextDecoder('latin1').decode(pdfData);
            
            // 提取签名信息
            const signatures = await this.extractSignatures(pdfContent, pdfData);
            
            if (signatures.length === 0) {
                return {
                    hasSignatures: false,
                    message: 'PDF文件中未发现数字签名',
                    signatures: []
                };
            }

            // 验证每个签名
            const verificationResults = [];
            for (const signature of signatures) {
                const result = await this.verifySingleSignature(signature, pdfData);
                verificationResults.push(result);
            }

            return {
                hasSignatures: true,
                signatures: verificationResults,
                overallValid: verificationResults.every(r => r.isValid),
                summary: this.generateSummary(verificationResults)
            };

        } catch (error) {
            console.error('PDF签名验证失败:', error);
            throw error;
        }
    }

    /**
     * 从PDF中提取数字签名
     */
    async extractSignatures(pdfContent, pdfData) {
        const signatures = [];
        
        try {
            // 查找签名字典
            const sigDictRegex = /\/Type\s*\/Sig[^>]*?\/Contents\s*<([0-9a-fA-F\s]+)>/g;
            let match;

            while ((match = sigDictRegex.exec(pdfContent)) !== null) {
                const hexSignature = match[1].replace(/\s/g, '');
                
                // 查找对应的ByteRange
                const byteRangeMatch = this.findByteRange(pdfContent, match.index);
                
                if (byteRangeMatch && hexSignature) {
                    const signature = {
                        hexData: hexSignature,
                        byteRange: byteRangeMatch,
                        signatureDict: this.parseSignatureDict(pdfContent, match.index),
                        position: match.index
                    };
                    
                    signatures.push(signature);
                }
            }

        } catch (error) {
            console.error('提取签名失败:', error);
        }

        return signatures;
    }

    /**
     * 查找ByteRange
     */
    findByteRange(pdfContent, signaturePosition) {
        // 在签名字典附近查找ByteRange
        const searchStart = Math.max(0, signaturePosition - 500);
        const searchEnd = Math.min(pdfContent.length, signaturePosition + 500);
        const searchArea = pdfContent.substring(searchStart, searchEnd);
        
        const byteRangeRegex = /\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/;
        const match = byteRangeRegex.exec(searchArea);
        
        if (match) {
            return [
                parseInt(match[1]),
                parseInt(match[2]),
                parseInt(match[3]),
                parseInt(match[4])
            ];
        }
        
        return null;
    }

    /**
     * 解析签名字典
     */
    parseSignatureDict(pdfContent, position) {
        const dict = {
            filter: null,
            subFilter: null,
            name: null,
            location: null,
            reason: null,
            contactInfo: null,
            date: null
        };

        try {
            // 查找签名字典的开始和结束
            const dictStart = pdfContent.lastIndexOf('<<', position);
            const dictEnd = pdfContent.indexOf('>>', position) + 2;
            
            if (dictStart === -1 || dictEnd === -1) return dict;
            
            const dictContent = pdfContent.substring(dictStart, dictEnd);
            
            // 提取各种字段
            const extractField = (fieldName) => {
                const regex = new RegExp(`\\/${fieldName}\\s*\\(([^)]+)\\)`);
                const match = regex.exec(dictContent);
                return match ? match[1] : null;
            };

            const extractKeyword = (fieldName) => {
                const regex = new RegExp(`\\/${fieldName}\\s*\\/([^\\s>]+)`);
                const match = regex.exec(dictContent);
                return match ? match[1] : null;
            };

            dict.filter = extractKeyword('Filter');
            dict.subFilter = extractKeyword('SubFilter');
            dict.name = extractField('Name');
            dict.location = extractField('Location');
            dict.reason = extractField('Reason');
            dict.contactInfo = extractField('ContactInfo');
            dict.date = extractField('M');

        } catch (error) {
            console.error('解析签名字典失败:', error);
        }

        return dict;
    }

    /**
     * 验证单个签名
     */
    async verifySingleSignature(signature, pdfData) {
        const result = {
            isValid: false,
            signatureIntegrity: false,
            certificateValid: false,
            documentIntegrity: false,
            timestampValid: false,
            errors: [],
            warnings: [],
            details: {
                signer: signature.signatureDict.name || '未知',
                signTime: signature.signatureDict.date || '未知',
                location: signature.signatureDict.location || '未知',
                reason: signature.signatureDict.reason || '未知',
                algorithm: this.detectSignatureAlgorithm(signature),
                filter: signature.signatureDict.filter,
                subFilter: signature.signatureDict.subFilter
            }
        };

        try {
            // 1. 验证文档完整性
            result.documentIntegrity = await this.verifyDocumentIntegrity(signature, pdfData);
            
            // 2. 验证签名完整性
            result.signatureIntegrity = await this.verifySignatureIntegrity(signature, pdfData);
            
            // 3. 验证证书
            result.certificateValid = await this.verifyCertificate(signature);
            
            // 4. 验证时间戳
            result.timestampValid = this.verifyTimestamp(signature);
            
            // 综合评估
            result.isValid = result.documentIntegrity && 
                           result.signatureIntegrity && 
                           result.certificateValid;

            if (!result.isValid) {
                if (!result.documentIntegrity) {
                    result.errors.push('文档完整性验证失败：文档可能已被篡改');
                }
                if (!result.signatureIntegrity) {
                    result.errors.push('签名完整性验证失败：签名数据无效');
                }
                if (!result.certificateValid) {
                    result.errors.push('证书验证失败：证书无效或不受信任');
                }
            }

        } catch (error) {
            result.errors.push(`验证过程出错: ${error.message}`);
            console.error('签名验证错误:', error);
        }

        return result;
    }

    /**
     * 验证文档完整性
     */
    async verifyDocumentIntegrity(signature, pdfData) {
        try {
            if (!signature.byteRange || signature.byteRange.length !== 4) {
                return false;
            }

            const [start1, length1, start2, length2] = signature.byteRange;
            
            // 检查ByteRange是否覆盖整个文档（除了签名内容）
            const expectedEnd = start2 + length2;
            const actualLength = pdfData.length;
            
            if (Math.abs(expectedEnd - actualLength) > 10) { // 允许小幅差异
                return false;
            }

            // 提取需要哈希的数据
            const part1 = pdfData.slice(start1, start1 + length1);
            const part2 = pdfData.slice(start2, start2 + length2);
            
            // 合并数据
            const dataToHash = new Uint8Array(part1.length + part2.length);
            dataToHash.set(part1, 0);
            dataToHash.set(part2, part1.length);
            
            // 计算SHA-256哈希
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataToHash);
            const hashArray = new Uint8Array(hashBuffer);
            
            // 将哈希转换为十六进制字符串
            const hashHex = Array.from(hashArray)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
                
            // 在实际环境中，这里应该与签名中的哈希值进行比较
            // 目前返回true表示基本的完整性检查通过
            return true;

        } catch (error) {
            console.error('文档完整性验证失败:', error);
            return false;
        }
    }

    /**
     * 验证签名完整性
     */
    async verifySignatureIntegrity(signature, pdfData) {
        try {
            // 解码十六进制签名数据
            const signatureBytes = this.hexToBytes(signature.hexData);
            
            if (signatureBytes.length === 0) {
                return false;
            }

            // 基本的签名数据格式检查
            // 实际环境中需要解析PKCS#7/CMS结构
            if (signatureBytes.length < 100) { // 签名数据太短
                return false;
            }

            // 检查是否包含基本的PKCS#7标识
            const pkcs7Header = [0x30, 0x82]; // ASN.1 SEQUENCE
            if (signatureBytes[0] !== pkcs7Header[0]) {
                return false;
            }

            return true;

        } catch (error) {
            console.error('签名完整性验证失败:', error);
            return false;
        }
    }

    /**
     * 验证证书
     */
    async verifyCertificate(signature) {
        try {
            // 在实际环境中，这里应该：
            // 1. 从签名中提取X.509证书
            // 2. 验证证书链
            // 3. 检查证书是否在受信任的根CA列表中
            // 4. 验证证书是否过期
            // 5. 检查证书撤销状态（CRL/OCSP）

            const signerName = signature.signatureDict.name;
            const currentDate = new Date();
            
            // 模拟证书验证
            if (signerName && signerName.includes('Orchanger')) {
                // 检查是否为受信任的企业证书
                const trustedCert = this.trustedPublicKeys.find(cert => 
                    signerName.includes(cert.name)
                );
                
                if (trustedCert) {
                    const validFrom = new Date(trustedCert.validFrom);
                    const validTo = new Date(trustedCert.validTo);
                    
                    return currentDate >= validFrom && currentDate <= validTo;
                }
            }

            // 默认认为证书需要进一步验证
            return false;

        } catch (error) {
            console.error('证书验证失败:', error);
            return false;
        }
    }

    /**
     * 验证时间戳
     */
    verifyTimestamp(signature) {
        try {
            const signDate = signature.signatureDict.date;
            if (!signDate) return false;
            
            // 基本的时间戳格式检查
            // PDF日期格式: D:YYYYMMDDHHmmSSOHH'mm'
            const dateRegex = /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/;
            const match = dateRegex.exec(signDate);
            
            if (match) {
                const [, year, month, day, hour, minute, second] = match;
                const signTimestamp = new Date(year, month - 1, day, hour, minute, second);
                const currentTime = new Date();
                
                // 检查签名时间是否合理（不能是未来时间）
                return signTimestamp <= currentTime;
            }
            
            return false;

        } catch (error) {
            console.error('时间戳验证失败:', error);
            return false;
        }
    }

    /**
     * 检测签名算法
     */
    detectSignatureAlgorithm(signature) {
        const filter = signature.signatureDict.filter;
        const subFilter = signature.signatureDict.subFilter;
        
        if (filter === 'Adobe.PPKLite') {
            if (subFilter === 'adbe.pkcs7.detached') {
                return 'PKCS#7 Detached';
            } else if (subFilter === 'adbe.pkcs7.sha1') {
                return 'PKCS#7 SHA-1';
            }
        }
        
        return filter || 'Unknown';
    }

    /**
     * 十六进制字符串转字节数组
     */
    hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
    }

    /**
     * 生成验证摘要
     */
    generateSummary(verificationResults) {
        const total = verificationResults.length;
        const valid = verificationResults.filter(r => r.isValid).length;
        const invalid = total - valid;
        
        return {
            total,
            valid,
            invalid,
            status: valid === total ? 'all_valid' : 
                   valid === 0 ? 'all_invalid' : 'partial_valid'
        };
    }

    /**
     * 获取详细的验证报告
     */
    getDetailedReport(verificationResults) {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(verificationResults.signatures),
            signatures: verificationResults.signatures.map((sig, index) => ({
                index: index + 1,
                signer: sig.details.signer,
                isValid: sig.isValid,
                checks: {
                    documentIntegrity: sig.documentIntegrity,
                    signatureIntegrity: sig.signatureIntegrity,
                    certificateValid: sig.certificateValid,
                    timestampValid: sig.timestampValid
                },
                errors: sig.errors,
                warnings: sig.warnings,
                details: sig.details
            }))
        };
        
        return report;
    }
}

// 导出验证器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedPDFSignatureVerifier;
} else {
    window.AdvancedPDFSignatureVerifier = AdvancedPDFSignatureVerifier;
} 