# PDF Signature Verification API (PDF签名验证API)

This service provides an API for verifying digital signatures in PDF documents. It checks the validity, integrity, and trust status of all PDF signatures in a document.

该服务提供用于验证PDF文档中数字签名的API。它检查PDF文档中所有签名的有效性、完整性和信任状态。

## Features (功能特点)

- PDF signature validation for all signatures in document (验证PDF文档中的所有签名)
- Certificate trust verification (证书信任验证)
- Signature integrity checking (签名完整性检查)
- Signature timestamp verification (签名时间戳验证)
- File size and format validation (文件大小和格式验证)
- Unified error handling (统一的错误处理)
- RESTful API interface (RESTful API接口)

## API Endpoints (API端点)

### GET /

Health check endpoint that returns service status.

健康检查端点，返回服务状态。

**Response (响应):**
```json
{
    "message": "PDF Signature Verification API"
}
```

### POST /verify-signature

Verifies all signatures in an uploaded PDF file.

验证上传的PDF文件中的所有签名。

**File Requirements (文件要求):**
- File format: PDF only (文件格式：仅限PDF)
- Maximum file size: 15MB (最大文件大小：15MB)
- Valid PDF structure (有效的PDF结构)

**Success Response Example (成功响应示例):**
```json
{
    "error": null,
    "has_signature": true,
    "signature_count": 2,
    "signatures": [
        {
            "signature_index": 0,
            "is_trusted_cert": true,
            "signing_cert_subject": "CN=Example Signer 1, O=Example Corp",
            "valid": true,
            "intact": true,
            "signing_time": "2024-03-20T10:00:00",
            "coverage": "ENTIRE_FILE"
        },
        {
            "signature_index": 1,
            "is_trusted_cert": false,
            "signing_cert_subject": "CN=Example Signer 2, O=Another Corp",
            "valid": true,
            "intact": true,
            "signing_time": "2024-03-21T14:30:00",
            "coverage": "ENTIRE_FILE"
        }
    ]
}
```

**Error Response Examples (错误响应示例):**

No signatures found:
```json
{
    "error": "PDF file does not contain any signatures",
    "has_signature": false,
    "signature_count": 0,
    "signatures": []
}
```

File too large:
```json
{
    "error": "File size (16777216 bytes) exceeds maximum allowed size (15728640 bytes)",
    "has_signature": false,
    "signature_count": 0,
    "signatures": []
}
```

Invalid PDF format:
```json
{
    "error": "File is not a valid PDF format",
    "has_signature": false,
    "signature_count": 0,
    "signatures": []
}
```

Corrupted PDF:
```json
{
    "error": "PDF file is corrupted or invalid: <specific error message>",
    "has_signature": false,
    "signature_count": 0,
    "signatures": []
}
```

**Response Fields (响应字段):**

- `error`: Error message (null if successful) (错误信息，成功时为null)
- `has_signature`: Whether the PDF contains signatures (PDF是否包含签名)
- `signature_count`: Total number of signatures (签名总数)
- `signatures`: Array of signature verification results (签名验证结果数组)
  - `signature_index`: Index of the signature (签名索引)
  - `is_trusted_cert`: Whether the certificate is in trusted list (证书是否在可信列表中)
  - `signing_cert_subject`: Certificate subject information (证书主题信息)
  - `valid`: Whether the signature is valid (签名是否有效)
  - `intact`: Whether the signature is intact (签名是否完整)
  - `signing_time`: When the document was signed (签名时间)
  - `coverage`: Signature coverage scope (签名覆盖范围)

## Requirements (依赖要求)

- Python 3.9+
- FastAPI
- pyHanko
- pyhanko-certvalidator
- Other dependencies listed in `requirements.txt`

## Deployment (部署方式)

### Docker Deployment (Docker部署)

**Quick Start Example (快速开始示例):**

```bash
docker run -p 8000:8000 --name signcheck-py -v "./cert":"/app/cert" hanjiaming/signcheck-py:tag
```

**Step-by-step Deployment (分步部署):**

1. Build the Docker image (构建Docker镜像):
```bash
docker build -t pdf-signature-verifier .
```

2. Create a directory for trusted certificates (创建可信证书目录):
```bash
mkdir -p cert
```

3. Create `cert/sha256.txt` with trusted certificate SHA256 hashes (创建包含可信证书SHA256哈希值的文件):
```bash
# One hash per line (每行一个哈希值)
echo "your_trusted_cert_sha256_hash_1" > cert/sha256.txt
echo "your_trusted_cert_sha256_hash_2" >> cert/sha256.txt
```

4. Run the container (运行容器):
```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/cert:/app/cert \
  --name pdf-signature-verifier \
  pdf-signature-verifier
```

### Local Deployment (本地部署)

1. Install dependencies (安装依赖):
```bash
pip install -r requirements.txt
```

2. Create trusted certificates list (创建可信证书列表):
```bash
mkdir -p cert
echo "your_trusted_cert_sha256_hash" > cert/sha256.txt
```

3. Run the application (运行应用):
```bash
python main.py --trusted-certs-sha256 cert/sha256.txt --host 0.0.0.0 --port 8000
```

## Configuration (配置)

The service can be configured using command-line arguments:

服务可以通过命令行参数进行配置：

- `--host`: Binding host (默认: 0.0.0.0)
- `--port`: Listening port (默认: 8000)
- `--trusted-certs-sha256`: Path to trusted certificates SHA256 list file (可信证书SHA256列表文件路径)

**Command Line Help (命令行帮助):**
```bash
python main.py --help
```

## Error Handling (错误处理)

The API handles various error conditions and always returns a consistent JSON format:

API处理各种错误情况并始终返回一致的JSON格式：

- **File size limit exceeded**: Files larger than 15MB are rejected (文件大小超限：大于15MB的文件被拒绝)
- **Invalid file format**: Non-PDF files are rejected (无效文件格式：非PDF文件被拒绝)
- **Corrupted PDF**: Damaged or malformed PDF files (损坏的PDF：损坏或格式错误的PDF文件)
- **No signatures**: PDF files without embedded signatures (无签名：没有嵌入签名的PDF文件)
- **Processing errors**: Various validation and processing errors (处理错误：各种验证和处理错误)

## Security Notes (安全说明)

1. Always keep your trusted certificates list up to date (始终保持可信证书列表最新)
2. Regularly update dependencies for security patches (定期更新依赖项以获取安全补丁)
3. Deploy behind a reverse proxy in production (在生产环境中部署在反向代理后面)
4. Use HTTPS in production environment (在生产环境中使用HTTPS)
5. Implement proper file upload size limits (实施适当的文件上传大小限制)
6. Monitor for suspicious file upload patterns (监控可疑的文件上传模式)