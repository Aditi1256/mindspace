# Multi-stage lightweight Dockerfile for FastAPI + ONNX Runtime Backend
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies for C++ extensions and OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final Runtime Stage
FROM python:3.11-slim

WORKDIR /app

# Install OpenCV runtime library requirements
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy backend application, ML pipeline and saved models
COPY backend/ /app/backend/
COPY ml/ /app/ml/
COPY saved_models/ /app/saved_models/

# Set working directory to backend root so imports align
WORKDIR /app/backend

ENV PYTHONPATH="/app:/app/backend"
ENV PORT=8000
ENV HOST="0.0.0.0"

EXPOSE 8000

# Run uvicorn server with production flags
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
