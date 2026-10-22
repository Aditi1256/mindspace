import sys
import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Body
from pydantic import BaseModel
from typing import Optional
from app.schemas import ExpressionPredictResponse

router = APIRouter(prefix="/expressions", tags=["Facial Expressions"])

MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB limit per PRD §11.3

class Base64PredictRequest(BaseModel):
    image_base64: str

@router.post("/predict", response_model=ExpressionPredictResponse)
async def predict_expression(
    request: Request,
    file: Optional[UploadFile] = File(None),
    payload: Optional[Base64PredictRequest] = Body(None)
):
    """
    In-memory facial expression prediction.
    Accepts multipart file or JSON base64 string.
    Never persists images to disk.
    """
    ml_service = getattr(request.app.state, "ml_service", None)
    if not ml_service:
        raise HTTPException(status_code=503, detail="ML inference service is not loaded.")

    image_data = None

    if file:
        content_type = file.content_type or ""
        if not (content_type.startswith("image/") or file.filename.lower().endswith((".jpg", ".jpeg", ".png"))):
            raise HTTPException(status_code=400, detail="Only JPEG or PNG images are supported.")
        
        image_data = await file.read()
        if len(image_data) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Image size exceeds 2MB limit (received {len(image_data)/(1024*1024):.1f}MB)."
            )
    elif payload and payload.image_base64:
        image_data = payload.image_base64
    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either multipart 'file' or JSON 'image_base64'."
        )

    try:
        result = ml_service.predict(image_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")
