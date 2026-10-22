import time
from collections import defaultdict
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

RATE_LIMIT_WINDOW_SECONDS = 60
MAX_PREDICT_PER_MINUTE = 45
MAX_AUTH_PER_MINUTE = 30

class SecurityHardeningMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # In-memory sliding window rate limits: {client_ip: [timestamps]}
        self.predict_requests = defaultdict(list)
        self.auth_requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        path = request.url.path

        # Rate limiting on /api/expressions/predict
        if "/expressions/predict" in path and request.method == "POST":
            timestamps = self.predict_requests[client_ip]
            self.predict_requests[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
            if len(self.predict_requests[client_ip]) >= MAX_PREDICT_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Rate limit exceeded on facial expression prediction (max 45/minute). Please slow down."}
                )
            self.predict_requests[client_ip].append(now)

        # Rate limiting on /api/auth/login and /api/auth/register
        if "/api/auth/" in path and request.method == "POST":
            timestamps = self.auth_requests[client_ip]
            self.auth_requests[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
            if len(self.auth_requests[client_ip]) >= MAX_AUTH_PER_MINUTE:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many authentication attempts. Please wait 1 minute before retrying."}
                )
            self.auth_requests[client_ip].append(now)

        # Process request
        response: Response = await call_next(request)

        # Security Headers (PRD Non-Functional Security Requirements §9)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(self)"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;"

        return response

