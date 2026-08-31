from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.dependencies import require_department
from app.schemas.department import (
    DepartmentProfileResponse,
    DepartmentStudentResponse,
    DepartmentTestResponse,
    DepartmentDashboardResponse,
)
from app.services.department_service import (
    get_department_profile,
    get_department_students,
    get_department_tests,
    get_department_dashboard,
)
from app.schemas.department import (
    DepartmentProfileResponse,
    DepartmentStudentResponse,
    DepartmentTestResponse,
    DepartmentDashboardResponse,
    DepartmentTestDetailResponse,
    DepartmentTestMonitorResponse,
    DepartmentStudentDetailResponse,
)

from app.services.department_service import (
    get_department_profile,
    get_department_students,
    get_department_tests,
    get_department_dashboard,
    get_department_test_detail,
    get_department_test_monitor,
    get_department_student_detail,
    close_department_test,
)


from app.schemas.test import (
    CreateTestRequest,
    CreateTestResponse,
)

from app.services.test_service import (
    create_department_test,
)
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Query,
    status,
)

from sqlalchemy import select

from app.models.test import Test, TestStatus
from app.services.media_service import save_test_media

router = APIRouter(
    prefix="/api/department",
    tags=["Department"],
)


def get_profile_or_404(
    db: Session,
    current_user: User,
):

    profile = get_department_profile(
        db,
        current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department profile not found.",
        )

    return profile


@router.get(
    "/me",
    response_model=DepartmentProfileResponse,
)
def department_me(
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):

    return get_profile_or_404(
        db,
        current_user,
    )


@router.get(
    "/students",
    response_model=list[DepartmentStudentResponse],
)
def department_students(
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):

    profile = get_profile_or_404(
        db,
        current_user,
    )

    students = get_department_students(
        db,
        profile.id,
    )

    return [
        DepartmentStudentResponse(
            user_id=student.user_id,
            profile_id=student.id,
            full_name=student.full_name,
            college_email=student.college_email,
            personal_email=student.personal_email,
            phone_number=student.phone_number,
            date_of_birth=student.date_of_birth.isoformat(),
            gender=student.gender,
            exam_roll_number=student.exam_roll_number,
            degree=student.degree,
            batch_year=student.batch_year,
            graduation_year=student.graduation_year,
        )
        for student in students
    ]
@router.get(
    "/students/{student_id}",
    response_model=DepartmentStudentDetailResponse,
)
def department_student_detail(
    student_id: UUID,
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(
        db,
        current_user,
    )

    student = get_department_student_detail(
        db=db,
        department_profile_id=profile.id,
        student_profile_id=student_id,
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found.",
        )

    return student

@router.get(
    "/tests",
    response_model=list[DepartmentTestResponse],
)
def department_tests(
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):

    profile = get_profile_or_404(
        db,
        current_user,
    )

    return get_department_tests(
        db,
        profile.id,
    )

@router.get(
    "/tests/{test_id}",
    response_model=DepartmentTestDetailResponse,
)
def department_test_detail(
    test_id: UUID,
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(
        db,
        current_user,
    )

    test = get_department_test_detail(
        db=db,
        department_profile_id=profile.id,
        test_id=test_id,
    )

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found.",
        )

    return test

@router.get(
    "/tests/{test_id}/monitor",
    response_model=DepartmentTestMonitorResponse,
)
def department_test_monitor(
    test_id: UUID,
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(
        db,
        current_user,
    )

    monitor = get_department_test_monitor(
        db=db,
        department_profile_id=profile.id,
        test_id=test_id,
    )

    if not monitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found.",
        )

    return monitor


@router.get(
    "/dashboard",
    response_model=DepartmentDashboardResponse,
)
def department_dashboard(
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):

    profile = get_profile_or_404(
        db,
        current_user,
    )

    return get_department_dashboard(
        db,
        profile.id,
    )


@router.post(
    "/tests",
    response_model=CreateTestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_test(
    data: CreateTestRequest,
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):

    profile = get_profile_or_404(
        db,
        current_user,
    )

    try:

        test = create_department_test(
            db=db,
            department=profile,
            data=data,
            current_user_id=current_user.id,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return CreateTestResponse(
        id=test.id,
        title=test.title,
        mode=test.mode.value,
        status=test.status.value,
        message="Test created successfully.",
        created_at=test.created_at,
    )

@router.post(
    "/tests/{test_id}/media",
)
async def upload_test_media(
    test_id: UUID,
    file: UploadFile = File(...),
    media_type: str = Query(...),
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(
        db,
        current_user,
    )

    test = db.scalar(
        select(Test).where(
            Test.id == test_id,
            Test.target_department_id == profile.id,
        )
    )

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found.",
        )

    if test.status != TestStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Media can only be uploaded to draft tests.",
        )

    try:

        path = await save_test_media(
            test_id=test.id,
            media_type=media_type,
            file=file,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return {
        "message": "Media uploaded successfully.",
        "path": path,
        "media_type": media_type,
        "filename": file.filename,
        "content_type": file.content_type,
    }

@router.post(
    "/tests/{test_id}/close",
)
def close_test(
    test_id: UUID,
    current_user: User = Depends(require_department),
    db: Session = Depends(get_db),
):
    profile = get_profile_or_404(
        db,
        current_user,
    )

    try:
        test = close_department_test(
            db=db,
            department_profile_id=profile.id,
            test_id=test_id,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found.",
        )

    return {
        "message": "Test closed successfully.",
        "test_id": str(test.id),
        "status": test.status.value,
    }