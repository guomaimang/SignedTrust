#!/bin/bash

# Build command arguments for uvicorn
ARGS="--host ${HOST} --port ${PORT} --trusted-certs-sha256 /app/cert/sha256.txt"

# Start the application with all arguments
exec python main.py ${ARGS}