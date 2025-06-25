from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from pyhanko_certvalidator import ValidationContext
from pyhanko_certvalidator.policy_decl import AcceptAllAlgorithms
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.validation import validate_pdf_signature
import io
import traceback
import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import wraps
import argparse
import sys
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时的代码
    yield
    # 关闭时的代码
    executor.shutdown(wait=True)

app = FastAPI(title="PDF Signature Verification API", version="v0", lifespan=lifespan)

# 创建线程池执行器
executor = ThreadPoolExecutor(max_workers=4)

# 全局变量存储可信SHA256列表
trusted_sha256_list = set()

def load_trusted_sha256_list(file_path: str):
    """
    从文件中加载可信的SHA256列表
    """
    global trusted_sha256_list
    
    if not os.path.exists(file_path):
        print(f"Warning: Trusted SHA256 list file not found: {file_path}")
        return
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            trusted_sha256_list = {
                line.strip().lower() 
                for line in f 
                if line.strip() and not line.strip().startswith('#')
            }
        print(f"Loaded {len(trusted_sha256_list)} trusted SHA256 certificates from {file_path}")
    except Exception as e:
        print(f"Error loading trusted SHA256 list: {e}")

def sync_validate_pdf(content: bytes):
    """
    同步验证 PDF 签名的函数
    """
    try:
        pdf_stream = io.BytesIO(content)
        
        # 创建验证上下文，允许所有算法（包括SHA1）以支持旧版PDF签名
        vc = ValidationContext(algorithm_usage_policy=AcceptAllAlgorithms())
        
        # 读取 PDF 文件
        try:
            r = PdfFileReader(pdf_stream)
        except Exception as e:
            return {
                "error": f"PDF file is corrupted or invalid: {str(e)}",
                "has_signature": False,
                "signature_count": 0,
                "signatures": []
            }
        
        # 检查是否有签名
        if not r.embedded_signatures:
            return {
                "error": "PDF file does not contain any signatures",
                "has_signature": False,
                "signature_count": 0,
                "signatures": []
            }
        
        # 验证所有签名
        signatures = []
        for i, sig in enumerate(r.embedded_signatures):
            try:
                status = validate_pdf_signature(sig, vc)
                
                # 获取签名证书的SHA256
                cert_sha256 = status.signing_cert.sha256.hex().lower()
                is_trusted = cert_sha256 in trusted_sha256_list
                
                # 准备单个签名的验证结果
                signature_result = {
                    # 签名索引
                    "signature_index": i,
                    # 签名证书的SHA256 是否位于可信列表中
                    "is_trusted_cert": is_trusted,
                    # 签名证书的主题
                    "signing_cert_subject": status.signing_cert.subject.human_friendly,
                    # 签名是否有效
                    "valid": status.valid,
                    # 签名是否完整
                    "intact": status.intact,
                    # 签名时间
                    "signing_time": status.signer_reported_dt.isoformat(),
                    # 签名覆盖范围
                    "coverage": str(status.coverage) if status.coverage else None,
                }
                
                signatures.append(signature_result)
                
            except Exception as e:
                # 如果某个签名验证失败，记录错误但继续验证其他签名
                error_result = {
                    "signature_index": i,
                    "error": f"Failed to validate signature {i}: {str(e)}",
                    "is_trusted_cert": False,
                    "signing_cert_subject": None,
                    "valid": False,
                    "intact": False,
                    "signing_time": None,
                    "coverage": None,
                }
                signatures.append(error_result)
        
        # 准备返回的数据（验证成功）
        result = {
            # 验证过程无错误
            "error": None,
            # 是否有签名
            "has_signature": True,
            # 签名总数
            "signature_count": len(r.embedded_signatures),
            # 所有签名的验证结果
            "signatures": signatures
        }
        
        return result
        
    except Exception as e:
        # 处理其他未预期的错误
        return {
            "error": f"Unexpected error during PDF signature validation: {str(e)}",
            "has_signature": False,
            "signature_count": 0,
            "signatures": []
        }

@app.get("/")
async def root():
    return {"message": "PDF Signature Verification API"}

@app.post("/verify-signature")
async def verify_pdf_signature(file: UploadFile = File(...)):
    """
    验证 PDF 文件的签名信息
    """
    try:
        # 检查文件类型
        if not file.filename.lower().endswith('.pdf'):
            return JSONResponse(
                status_code=400, 
                content={
                    "error": "Only PDF files are allowed",
                    "has_signature": False,
                    "signature_count": 0,
                    "signatures": []
                }
            )
        
        # 读取文件内容
        content = await file.read()
        
        # 检查文件大小（15MB = 15 * 1024 * 1024 bytes）
        MAX_FILE_SIZE = 15 * 1024 * 1024
        if len(content) > MAX_FILE_SIZE:
            return JSONResponse(
                status_code=400,
                content={
                    "error": f"File size ({len(content)} bytes) exceeds maximum allowed size ({MAX_FILE_SIZE} bytes)",
                    "has_signature": False,
                    "signature_count": 0,
                    "signatures": []
                }
            )
        
        # 基本的PDF格式检查
        if not content.startswith(b'%PDF-'):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "File is not a valid PDF format",
                    "has_signature": False,
                    "signature_count": 0,
                    "signatures": []
                }
            )
        
        # 在线程池中运行同步的 PDF 验证函数
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, sync_validate_pdf, content)
        
        return JSONResponse(status_code=200, content=result)
        
    except Exception as e:
        # 记录详细错误信息
        error_detail = f"Error processing PDF: {str(e)}\n{traceback.format_exc()}"
        print(error_detail)  # 在服务器日志中记录
        
        return JSONResponse(
            status_code=500,
            content={
                "error": f"Failed to process PDF signature: {str(e)}",
                "has_signature": False,
                "signature_count": 0,
                "signatures": []
            }
        )


def parse_args():
    """
    解析命令行参数
    """
    parser = argparse.ArgumentParser(description="PDF Signature Verification API")
    parser.add_argument(
        "--trusted-certs-sha256", 
        type=str, 
        help="Path to txt file containing trusted certificate SHA256 hashes (one per line)"
    )
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")
    
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    # 加载可信SHA256列表
    if args.trusted_certs_sha256:
        load_trusted_sha256_list(args.trusted_certs_sha256)
    else:
        print("Warning: No trusted certificate list provided. Use --trusted-certs-sha256 to specify a file.")
    
    import uvicorn
    uvicorn.run(app, host=args.host, port=args.port) 