
# app/services/test_release_service.py

import random
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.test import Test, TestMode, TestStatus, TestCreatorRole
from app.models.test_assignment import TestAssignment, AssignmentStatus
from app.models.assignment_question import AssignmentQuestion
from app.models.test_question import TestQuestion
from app.models.question_bank import QuestionBank, DifficultyLevel
from app.models.student_profile import StudentProfile
from app.models.department_profile import DepartmentProfile
from app.models.tpo_profile import TPOProfile


def _get_students_for_test(
    db: Session,
    test: Test,
) -> list[StudentProfile]:

    if test.creator_role == TestCreatorRole.DEPARTMENT:

        if not test.target_department_id:
            raise ValueError(
                "Department test must have a target department."
            )

        students = db.scalars(
            select(StudentProfile).where(
                StudentProfile.department_profile_id
                == test.target_department_id
            )
        ).all()

        return list(students)

    if test.creator_role == TestCreatorRole.TPO:

        if not test.target_tpo_id:
            raise ValueError(
                "TPO test must have a target TPO."
            )

        department_ids = db.scalars(
            select(DepartmentProfile.id).where(
                DepartmentProfile.tpo_profile_id
                == test.target_tpo_id
            )
        ).all()

        if not department_ids:
            return []

        students = db.scalars(
            select(StudentProfile).where(
                StudentProfile.department_profile_id.in_(
                    department_ids
                )
            )
        ).all()

        return list(students)

    raise ValueError("Invalid test creator role.")


def _question_to_snapshot(question: QuestionBank) -> dict:
    return {
        "question_bank_id": str(question.id),
        "subject": question.subject,
        "topic": question.topic,
        "subtopic": question.subtopic,
        "question_type": question.question_type.value,
        "difficulty": question.difficulty.value,
        "question_content": question.question_content,
        "answer": question.answer,
        "explanation": question.explanation,
    }


def _select_automatic_questions(
    db: Session,
    test: Test,
) -> list[tuple[QuestionBank, float | None]]:

    configuration = test.configuration or {}

    requirements = configuration.get("requirements", [])

    if not requirements:
        raise ValueError(
            "Automatic test configuration must contain requirements."
        )

    selected: list[tuple[QuestionBank, float | None]] = []

    for requirement in requirements:

        subject = requirement.get("subject")
        topic = requirement.get("topic")
        subtopic = requirement.get("subtopic")

        difficulty = requirement.get("difficulty")
        question_type = requirement.get("question_type")

        count = requirement.get("count")

        if not subject:
            raise ValueError(
                "Each automatic question requirement needs a subject."
            )

        if not count or count <= 0:
            raise ValueError(
                "Each automatic question requirement needs a valid count."
            )

        query = select(QuestionBank).where(
            QuestionBank.subject == subject
        )

        if topic:
            query = query.where(
                QuestionBank.topic == topic
            )

        if subtopic:
            query = query.where(
                QuestionBank.subtopic == subtopic
            )

        if difficulty:
            query = query.where(
                QuestionBank.difficulty
                == DifficultyLevel(difficulty)
            )

        if question_type:
            query = query.where(
                QuestionBank.question_type == question_type
            )

        available = list(
            db.scalars(query).all()
        )

        if len(available) < count:
            raise ValueError(
                f"Not enough questions available for "
                f"{subject}"
                f"{' / ' + topic if topic else ''}"
                f" ({difficulty or 'ANY'}). "
                f"Required: {count}, available: {len(available)}."
            )

        random.shuffle(available)

        for question in available[:count]:
            marks = requirement.get("marks")
            selected.append((question, marks))

    return selected


def _create_assignment_questions(
    db: Session,
    assignment: TestAssignment,
    test: Test,
) -> None:

    if test.mode == TestMode.AUTOMATIC:

        questions = _select_automatic_questions(
            db=db,
            test=test,
        )

        for sequence, (question, marks) in enumerate(
            questions,
            start=1,
        ):
            assignment_question = AssignmentQuestion(
                assignment_id=assignment.id,
                sequence_number=sequence,
                question_bank_id=question.id,
                question_snapshot=_question_to_snapshot(question),
                marks=marks,
            )

            db.add(assignment_question)

    elif test.mode == TestMode.MANUAL:

        manual_questions = db.scalars(
            select(TestQuestion)
            .where(TestQuestion.test_id == test.id)
            .order_by(TestQuestion.sequence_number)
        ).all()

        if not manual_questions:
            raise ValueError(
                "Manual test does not contain any questions."
            )

        for question in manual_questions:

            snapshot = question.question_content.copy()
            
            if question.question_metadata:
                snapshot["question_metadata"] = question.question_metadata

            assignment_question = AssignmentQuestion(
                assignment_id=assignment.id,
                sequence_number=question.sequence_number,
                question_bank_id=None,
                question_snapshot=snapshot,
                marks=question.marks,
            )

            db.add(assignment_question)

    elif test.mode == TestMode.ADAPTIVE:

        # Adaptive questions will be selected when
        # the student starts the test.
        return


def release_test(
    db: Session,
    test: Test,
) -> tuple[Test, int]:

    if test.status != TestStatus.DRAFT:
        raise ValueError(
            "Only draft tests can be released."
        )

    students = _get_students_for_test(
        db=db,
        test=test,
    )

    if not students:
        raise ValueError(
            "No students are available for this test."
        )

    # Validate automatic configuration before changing
    # the test status.
    if test.mode == TestMode.AUTOMATIC:
        _select_automatic_questions(
            db=db,
            test=test,
        )

    if test.mode == TestMode.MANUAL:

        question_exists = db.scalar(
            select(TestQuestion.id)
            .where(TestQuestion.test_id == test.id)
            .limit(1)
        )

        if not question_exists:
            raise ValueError(
                "Manual test does not contain any questions."
            )

    existing_student_ids = set(
        db.scalars(
            select(TestAssignment.student_profile_id)
            .where(TestAssignment.test_id == test.id)
        ).all()
    )

    created_count = 0

    for student in students:

        # Prevent duplicate assignments.
        if student.id in existing_student_ids:
            continue

        assignment = TestAssignment(
            test_id=test.id,
            student_profile_id=student.id,
            status=AssignmentStatus.ASSIGNED,
        )

        db.add(assignment)

        # Flush so assignment.id is available.
        db.flush()

        _create_assignment_questions(
            db=db,
            assignment=assignment,
            test=test,
        )

        created_count += 1

    from sqlalchemy.sql import func

    test.status = TestStatus.RELEASED
    test.released_at = func.now()

    db.commit()
    db.refresh(test)

    return test, created_count
