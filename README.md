# SignedTrust - Digital Signature Verification Platform

[![Python](https://img.shields.io/badge/python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-19.1+-61dafb.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688.svg)](https://fastapi.tiangolo.com)

## Overview

SignedTrust is an enterprise-grade digital signature verification platform designed to validate PDF document signatures and ensure document integrity. The platform consists of a modern React frontend and a robust Python FastAPI backend, providing comprehensive signature verification capabilities for both legacy and modern digital signatures.

![1749239329949.png](https://pic.hanjiaming.com.cn/2025/06/07/93eddfed06ddb.png)

## Declaration

The project was completed by the author during the campus-enterprise cooperation program. 

**The campus/company agrees to open-source the code by author, and the copyright and distribution rights belong to the author.**

## Features

### 🔒 Digital Signature Verification
- **PDF Signature Validation**: Comprehensive verification of embedded PDF signatures
- **Certificate Trust Chain**: Validation against trusted certificate authorities
- **Multi-signature Support**: Handle documents with multiple digital signatures
- **Legacy Compatibility**: Support for SHA-1 and modern cryptographic algorithms

### 🌐 Modern Web Interface
- **Responsive Design**: Optimized for desktop and mobile devices
- **Material-UI Components**: Modern, accessible user interface
- **Real-time Validation**: Instant feedback on signature verification
- **Detailed Reports**: Comprehensive signature analysis and reporting

### 🛡️ Security Features
- **Trusted Certificate Lists**: Configurable whitelist of trusted certificates
- **File Size Limits**: Protection against large file uploads (15MB limit)
- **Format Validation**: Strict PDF format checking
- **Error Handling**: Graceful handling of corrupted or invalid files

## Architecture

### Frontend (`signedtrust-frontdesk/`)
- **Framework**: React 19.1+ with Vite
- **UI Library**: Material-UI v6 with emotion styling
- **State Management**: Zustand for lightweight state management
- **Routing**: React Router DOM for navigation
- **HTTP Client**: Axios with interceptors
- **Notifications**: Notistack for user feedback
- **Date Handling**: date-fns for timestamp formatting

### Backend (`signcheck-py/`)
- **Framework**: FastAPI for high-performance API
- **PDF Processing**: PyHanko for PDF signature validation
- **Certificate Validation**: pyhanko-certvalidator for certificate chain verification
- **Async Processing**: ThreadPoolExecutor for non-blocking operations
- **Containerization**: Docker support with optimized Dockerfile

## Getting Started

### Prerequisites
- **Node.js** 18+ and pnpm (for frontend)
- **Python** 3.8+ (for backend)
- **Docker** (optional, for containerized deployment)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd signedtrust-frontdesk
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Build for production:
   ```bash
   pnpm build
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd signcheck-py
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   python main.py --port 8000
   ```

### Docker Deployment

For production deployment using Docker:

```bash
cd signcheck-py
docker build -t signedtrust-backend .
docker run -p 8000:8000 signedtrust-backend
```

## API Documentation

### Endpoints

#### `GET /`
Returns API status and information.

#### `POST /verify-signature`
Verifies PDF document signatures.

**Request**: Multipart form data with PDF file
**Response**: JSON with signature verification results

```json
{
  "error": null,
  "has_signature": true,
  "signature_count": 1,
  "signatures": [
    {
      "signature_index": 0,
      "is_trusted_cert": true,
      "signing_cert_subject": "Common Name: Orchanger, Organization: Orchanger Co Ltd",
      "valid": true,
      "intact": true,
      "signing_time": "2025-06-05T22:09:24+08:00",
      "coverage": "SignatureCoverageLevel.ENTIRE_FILE"
    }
  ]
}
```

## Verification Criteria

### Signature Validation
A signature is considered **VALID** when all of the following conditions are met:

1. **Certificate Trustworthiness**: `is_trusted_cert` = true
2. **Signature Validity**: `valid` = true AND `intact` = true
3. **Coverage Completeness**: `coverage` = "ENTIRE_FILE" or "ENTIRE_REVISION"

### Document Validation
A document is considered **VERIFIED** when:
- All signatures pass individual validation
- At least one signature has `coverage` = "ENTIRE_FILE"
- No error conditions are present

## Configuration

### Trusted Certificates
Configure trusted certificate SHA256 fingerprints in the backend by providing a file with certificate hashes (one per line).

### File Limits
- Maximum file size: 15MB
- Supported format: PDF only
- Multiple signatures per document supported

## Development

### Code Style
- **Frontend**: ESLint configuration with React hooks and refresh plugins
- **Backend**: Python type hints and FastAPI best practices
- **Documentation**: Comprehensive inline documentation

### Project Structure
```
signedtrust
├── signedtrust-frontdesk/     # React frontend application
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   └── dist/                  # Production build
├── signcheck-py/              # FastAPI backend
│   ├── main.py                # Application entry point
│   ├── cert/                  # Certificate storage
│   └── demo/                  # Demo files
├── docs/                      # Project documentation
└── requirements.txt           # Root dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [PyHanko](https://github.com/MatthiasValvekens/pyHanko) - PDF signature validation
- [Material-UI](https://mui.com/) - React component library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Vite](https://vitejs.dev/) - Fast build tool and development server
