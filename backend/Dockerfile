FROM python:3.11-slim

WORKDIR /app

# System deps for scipy/numpy wheels and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# CPU-only PyTorch keeps the image small (avoids pulling NVIDIA CUDA wheels on ARM/x86)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY syra_backend ./syra_backend

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
# Persist feedback / Bayesian threshold SQLite outside container filesystem
ENV SYRA_FEEDBACK_DB=/data/syra_feedback.db

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f -H "Authorization: Bearer internal" http://127.0.0.1:8001/v1/health || exit 1

CMD ["uvicorn", "syra_backend.main:app", "--host", "0.0.0.0", "--port", "8001"]
