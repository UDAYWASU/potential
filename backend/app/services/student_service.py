from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student_profile import StudentProfile
from app.models.test import Test
from app.models.test_assignment import (
    AssignmentStatus,
    TestAssignment,
)
from app.models.assignment_question import AssignmentQuestion
from app.models.question_response import QuestionResponse


def get_student_profile(
    db: Session,
    user_id: UUID,
) -> StudentProfile | None:

    return (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == user_id,
        )
        .first()
    )


def get_student_tests(
    db: Session,
    student_profile_id: UUID,
) -> list[tuple[TestAssignment, Test]]:

    result = db.execute(
        select(TestAssignment, Test)
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .where(
            TestAssignment.student_profile_id
            == student_profile_id,
        )
        .order_by(
            TestAssignment.created_at.desc(),
        )
    )

    return result.all()


# ============================================================
# 4C — TEST ATTEMPT SERVICES
# ============================================================

def get_student_assignment(
    db: Session,
    assignment_id: UUID,
    student_profile_id: UUID,
) -> tuple[TestAssignment, Test] | None:

    result = db.execute(
        select(TestAssignment, Test)
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .where(
            TestAssignment.id == assignment_id,
            TestAssignment.student_profile_id == student_profile_id,
        )
    )

    return result.first()


def get_assignment_questions(
    db: Session,
    assignment_id: UUID,
) -> list[AssignmentQuestion]:

    result = db.execute(
        select(AssignmentQuestion)
        .where(
            AssignmentQuestion.assignment_id == assignment_id,
        )
        .order_by(
            AssignmentQuestion.sequence_number.asc(),
        )
    )

    return result.scalars().all()


def start_student_assignment(
    db: Session,
    assignment: TestAssignment,
) -> TestAssignment:

    if assignment.status == AssignmentStatus.ASSIGNED:

        assignment.status = AssignmentStatus.IN_PROGRESS
        assignment.started_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(assignment)

    return assignment


def get_question_response(
    db: Session,
    assignment_question_id: UUID,
) -> QuestionResponse | None:

    return db.scalar(
        select(QuestionResponse)
        .where(
            QuestionResponse.assignment_question_id
            == assignment_question_id,
        )
        .order_by(
            QuestionResponse.submitted_at.desc(),
        )
    )


def save_student_answer(
    db: Session,
    assignment: TestAssignment,
    assignment_question_id: UUID,
    answer: dict | None,
) -> QuestionResponse:

    question = db.scalar(
        select(AssignmentQuestion)
        .where(
            AssignmentQuestion.id == assignment_question_id,
            AssignmentQuestion.assignment_id == assignment.id,
        )
    )

    if not question:
        raise ValueError("Question does not belong to this test.")

    if assignment.status != AssignmentStatus.IN_PROGRESS:
        raise ValueError(
            "Answers can only be submitted while the test is in progress."
        )

    response = get_question_response(
        db,
        assignment_question_id,
    )

    if response:

        response.answer = answer
        response.submitted_at = datetime.now(timezone.utc)

    else:

        response = QuestionResponse(
            assignment_question_id=assignment_question_id,
            answer=answer,
        )

        db.add(response)

    db.commit()
    db.refresh(response)

    return response


def submit_student_assignment(
    db: Session,
    assignment: TestAssignment,
) -> TestAssignment:

    if assignment.status != AssignmentStatus.IN_PROGRESS:
        raise ValueError(
            "Only an in-progress test can be submitted."
        )

    assignment.status = AssignmentStatus.SUBMITTED
    assignment.submitted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(assignment)

    return assignment