from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import require_student
from app.db.session import get_db
from app.models.user import User
from app.schemas.student import (
    StudentProfileResponse,
    StudentTestAssignmentResponse,
    StudentTestsResponse,
    StudentAttemptQuestionResponse,
    StudentTestAttemptResponse,
    StudentAnswerRequest,
    StudentAnswerResponse,
    StudentSubmitResponse,
)

from uuid import UUID

from app.models.test import TestStatus
from app.models.test_assignment import AssignmentStatus

from app.services.student_service import (
    get_student_profile,
    get_student_tests,
    get_student_assignment,
    get_assignment_questions,
    start_student_assignment,
    save_student_answer,
    submit_student_assignment,
    get_question_response,
)

router = APIRouter(
    prefix="/api/student",
    tags=["Student"],
)


@router.get(
    "/me",
    response_model=StudentProfileResponse,
)
def student_me(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    return StudentProfileResponse(
        user_id=profile.user_id,
        profile_id=profile.id,
        full_name=profile.full_name,
        college_email=profile.college_email,
        personal_email=profile.personal_email,
        phone_number=profile.phone_number,
        date_of_birth=profile.date_of_birth,
        gender=profile.gender,
        exam_roll_number=profile.exam_roll_number,
        degree=profile.degree,
        batch_year=profile.batch_year,
        graduation_year=profile.graduation_year,
        department_profile_id=profile.department_profile_id,
    )


@router.get(
    "/tests",
    response_model=StudentTestsResponse,
)
def student_tests(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    assignments = get_student_tests(
        db=db,
        student_profile_id=profile.id,
    )

    return StudentTestsResponse(
        tests=[
            StudentTestAssignmentResponse(
                assignment_id=assignment.id,
                test_id=test.id,
                title=test.title,
                description=test.description,
                mode=test.mode.value,
                duration_minutes=test.duration_minutes,
                status=assignment.status.value,
                assigned_at=assignment.created_at,
                started_at=assignment.started_at,
                submitted_at=assignment.submitted_at,
                released_at=test.released_at,
            )
            for assignment, test in assignments
        ]
    )

# ============================================================
# 4C — START TEST
# ============================================================

@router.post(
    "/assignments/{assignment_id}/start",
    response_model=StudentTestAttemptResponse,
)
def start_test(
    assignment_id: UUID,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    result = get_student_assignment(
        db=db,
        assignment_id=assignment_id,
        student_profile_id=profile.id,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test assignment not found.",
        )

    assignment, test = result

    if assignment.status == AssignmentStatus.SUBMITTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test has already been submitted.",
        )

    if assignment.status == AssignmentStatus.MISSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test can no longer be attempted.",
        )

    if test.status != TestStatus.RELEASED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test is not currently available.",
        )

    assignment = start_student_assignment(
        db=db,
        assignment=assignment,
    )

    questions = get_assignment_questions(
        db=db,
        assignment_id=assignment.id,
    )

    return StudentTestAttemptResponse(
        assignment_id=assignment.id,
        test_id=test.id,
        title=test.title,
        description=test.description,
        mode=test.mode.value,
        duration_minutes=test.duration_minutes,
        status=assignment.status.value,
        started_at=assignment.started_at,
        submitted_at=assignment.submitted_at,
        questions=[
            StudentAttemptQuestionResponse(
                question_id=question.id,
                sequence_number=question.sequence_number,
                question=question.question_snapshot,
                marks=question.marks,
                answer=(
                    get_question_response(
                        db,
                        question.id,
                    ).answer
                    if get_question_response(
                        db,
                        question.id,
                    )
                    else None
                ),
                is_answered=(
                    get_question_response(
                        db,
                        question.id,
                    )
                    is not None
                ),
            )
            for question in questions
        ],
    )

# ============================================================
# 4C — GET CURRENT ATTEMPT
# ============================================================

@router.get(
    "/assignments/{assignment_id}",
    response_model=StudentTestAttemptResponse,
)
def get_test_attempt(
    assignment_id: UUID,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    result = get_student_assignment(
        db=db,
        assignment_id=assignment_id,
        student_profile_id=profile.id,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test assignment not found.",
        )

    assignment, test = result

    if assignment.status not in (
        AssignmentStatus.IN_PROGRESS,
        AssignmentStatus.SUBMITTED,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test has not been started.",
        )

    questions = get_assignment_questions(
        db=db,
        assignment_id=assignment.id,
    )

    question_responses = {}

    for question in questions:

        response = get_question_response(
            db,
            question.id,
        )

        question_responses[question.id] = response

    return StudentTestAttemptResponse(
        assignment_id=assignment.id,
        test_id=test.id,
        title=test.title,
        description=test.description,
        mode=test.mode.value,
        duration_minutes=test.duration_minutes,
        status=assignment.status.value,
        started_at=assignment.started_at,
        submitted_at=assignment.submitted_at,
        questions=[
            StudentAttemptQuestionResponse(
                question_id=question.id,
                sequence_number=question.sequence_number,
                question=question.question_snapshot,
                marks=question.marks,
                answer=(
                    question_responses[question.id].answer
                    if question_responses[question.id]
                    else None
                ),
                is_answered=(
                    question_responses[question.id]
                    is not None
                ),
            )
            for question in questions
        ],
    )

# ============================================================
# 4C — SAVE ANSWER
# ============================================================

@router.post(
    "/assignments/{assignment_id}/questions/{question_id}/answer",
    response_model=StudentAnswerResponse,
)
def save_answer(
    assignment_id: UUID,
    question_id: UUID,
    data: StudentAnswerRequest,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    result = get_student_assignment(
        db=db,
        assignment_id=assignment_id,
        student_profile_id=profile.id,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test assignment not found.",
        )

    assignment, _ = result

    try:

        response = save_student_answer(
            db=db,
            assignment=assignment,
            assignment_question_id=question_id,
            answer=data.answer,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return StudentAnswerResponse(
        message="Answer saved successfully.",
        question_id=question_id,
        answer=response.answer,
    )

# ============================================================
# 4C — SUBMIT TEST
# ============================================================

@router.post(
    "/assignments/{assignment_id}/submit",
    response_model=StudentSubmitResponse,
)
def submit_test(
    assignment_id: UUID,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):

    profile = get_student_profile(
        db=db,
        user_id=current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found.",
        )

    result = get_student_assignment(
        db=db,
        assignment_id=assignment_id,
        student_profile_id=profile.id,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test assignment not found.",
        )

    assignment, _ = result

    try:

        assignment = submit_student_assignment(
            db=db,
            assignment=assignment,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    return StudentSubmitResponse(
        message="Test submitted successfully.",
        assignment_id=assignment.id,
        status=assignment.status.value,
        submitted_at=assignment.submitted_at,
    )

