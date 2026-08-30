# app/services/media_service.py

import uuid
from pathlib import Path

from fastapi import UploadFile


UPLOAD_ROOT = Path("uploads")
TEST_MEDIA_ROOT = UPLOAD_ROOT / "tests"


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/mp4": ".m4a",
    "audio/x-m4a": ".m4a",
}


MAX_IMAGE_SIZE = 10 * 1024 * 1024       # 10 MB
MAX_AUDIO_SIZE = 25 * 1024 * 1024       # 25 MB


async def save_test_media(
    *,
    test_id: uuid.UUID,
    media_type: str,
    file: UploadFile,
) -> str:

    if media_type not in {"image", "audio"}:
        raise ValueError(
            "media_type must be either 'image' or 'audio'."
        )

    content_type = file.content_type or ""

    if media_type == "image":
        allowed_types = ALLOWED_IMAGE_TYPES
        max_size = MAX_IMAGE_SIZE
        folder = "images"

    else:
        allowed_types = ALLOWED_AUDIO_TYPES
        max_size = MAX_AUDIO_SIZE
        folder = "audio"

    if content_type not in allowed_types:
        raise ValueError(
            f"Unsupported {media_type} file type: "
            f"{content_type}"
        )

    extension = allowed_types[content_type]

    directory = (
        TEST_MEDIA_ROOT
        / str(test_id)
        / "questions"
        / folder
    )

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = f"{uuid.uuid4()}{extension}"

    destination = directory / filename

    total_size = 0
    chunk_size = 1024 * 1024

    try:

        with destination.open("wb") as output:

            while True:

                chunk = await file.read(chunk_size)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > max_size:
                    output.close()

                    if destination.exists():
                        destination.unlink()

                    raise ValueError(
                        f"{media_type.capitalize()} file "
                        f"must be smaller than "
                        f"{max_size // (1024 * 1024)} MB."
                    )

                output.write(chunk)

    finally:
        await file.close()

    return (
        f"/uploads/tests/"
        f"{test_id}/questions/"
        f"{folder}/{filename}"
    )