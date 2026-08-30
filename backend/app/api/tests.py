
# app/api/tests.py

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.test import Test, TestCreatorRole
from app.models.user import User
from app.api.dependencies import get_current_user
from app.services.test_release_service import release_test


router = APIRouter(
    prefix="/api/tests",
    tags=["Tests"],
)


@router.post(
    "/{test_id}/release",
)
def release_test_endpoint(
    test_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only TPO and Department users can release tests.
    if current_user.role.value not in {
        "TPO",
        "DEPARTMENT",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only TPO or Department users can release tests.",
        )

    test = db.scalar(
        select(Test).where(
            Test.id == test_id
        )
    )

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found.",
        )

    # Creator ownership check.
    if test.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only release tests created by you.",
        )

    # Verify creator role matches the test.
    if test.creator_role.value != current_user.role.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Test creator role does not match your account.",
        )

    try:
        test, assignment_count = release_test(
            db=db,
            test=test,
        )

    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return {
        "message": "Test released successfully.",
        "test_id": str(test.id),
        "status": test.status.value,
        "assignments_created": assignment_count,
        "released_at": test.released_at,
    }
