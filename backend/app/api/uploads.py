import uuid

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status

from app.api.dependencies import require_department
from app.models.user import User
from app.services.media_service import save_test_media


router = APIRouter(
    prefix="/api/uploads",
    tags=["Uploads"],
)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_department),
):
    # Temporary endpoint.
    # The test_id should eventually come from the test/question
    # creation flow.
    test_id = uuid.uuid4()

    try:
        file_url = await save_test_media(
            test_id=test_id,
            media_type="image",
            file=file,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return {
        "message": "Image uploaded successfully.",
        "file_url": file_url,
    }


@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(require_department),
):
    test_id = uuid.uuid4()

    try:
        file_url = await save_test_media(
            test_id=test_id,
            media_type="audio",
            file=file,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return {
        "message": "Audio uploaded successfully.",
        "file_url": file_url,
    }