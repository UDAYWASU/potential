from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.department_profile import DepartmentProfile
from app.models.student_profile import StudentProfile
from app.models.test import Test
from app.models.test_assignment import TestAssignment
from app.models.test_result import TestResult
from app.models.test_question import TestQuestion
from app.models.test_assignment import (
    TestAssignment,
    AssignmentStatus,
)
from app.models.student_profile import StudentProfile

def get_department_test_detail(
    db: Session,
    department_profile_id: UUID,
    test_id: UUID,
):
    test = (
        db.query(Test)
        .filter(
            Test.id == test_id,
            Test.target_department_id == department_profile_id,
        )
        .first()
    )

    if not test:
        return None

    question_count = (
        db.query(func.count(TestQuestion.id))
        .filter(
            TestQuestion.test_id == test.id
        )
        .scalar()
        or 0
    )

    assigned_count = (
        db.query(func.count(TestAssignment.id))
        .filter(
            TestAssignment.test_id == test.id
        )
        .scalar()
        or 0
    )

    in_progress_count = (
        db.query(func.count(TestAssignment.id))
        .filter(
            TestAssignment.test_id == test.id,
            TestAssignment.status == AssignmentStatus.IN_PROGRESS,
        )
        .scalar()
        or 0
    )

    submitted_count = (
        db.query(func.count(TestAssignment.id))
        .filter(
            TestAssignment.test_id == test.id,
            TestAssignment.status == AssignmentStatus.SUBMITTED,
        )
        .scalar()
        or 0
    )

    missed_count = (
        db.query(func.count(TestAssignment.id))
        .filter(
            TestAssignment.test_id == test.id,
            TestAssignment.status == AssignmentStatus.MISSED,
        )
        .scalar()
        or 0
    )

    return {
        "id": test.id,
        "title": test.title,
        "description": test.description,
        "mode": test.mode.value,
        "status": test.status.value,
        "duration_minutes": test.duration_minutes,
        "created_at": test.created_at,
        "released_at": test.released_at,
        "question_count": question_count,
        "assigned_count": assigned_count,
        "in_progress_count": in_progress_count,
        "submitted_count": submitted_count,
        "missed_count": missed_count,
    }
def get_department_test_monitor(
    db: Session,
    department_profile_id: UUID,
    test_id: UUID,
):
    test = (
        db.query(Test)
        .filter(
            Test.id == test_id,
            Test.target_department_id == department_profile_id,
        )
        .first()
    )

    if not test:
        return None

    rows = (
        db.query(
            TestAssignment,
            StudentProfile,
        )
        .join(
            StudentProfile,
            StudentProfile.id
            == TestAssignment.student_profile_id,
        )
        .filter(
            TestAssignment.test_id == test.id,
            StudentProfile.department_profile_id
            == department_profile_id,
        )
        .order_by(StudentProfile.full_name)
        .all()
    )

    students = []

    assigned_count = 0
    in_progress_count = 0
    submitted_count = 0
    missed_count = 0

    for assignment, student in rows:

        if assignment.status == AssignmentStatus.ASSIGNED:
            assigned_count += 1

        elif assignment.status == AssignmentStatus.IN_PROGRESS:
            in_progress_count += 1

        elif assignment.status == AssignmentStatus.SUBMITTED:
            submitted_count += 1

        elif assignment.status == AssignmentStatus.MISSED:
            missed_count += 1

        students.append(
            {
                "assignment_id": assignment.id,
                "student_profile_id": student.id,
                "student_name": student.full_name,
                "status": assignment.status.value,
                "started_at": assignment.started_at,
                "submitted_at": assignment.submitted_at,
            }
        )

    return {
        "test_id": test.id,
        "test_title": test.title,
        "assigned_count": assigned_count,
        "in_progress_count": in_progress_count,
        "submitted_count": submitted_count,
        "missed_count": missed_count,
        "students": students,
    }



def get_department_profile(
    db: Session,
    user_id: UUID,
) -> DepartmentProfile | None:

    return (
        db.query(DepartmentProfile)
        .filter(DepartmentProfile.user_id == user_id)
        .first()
    )


def get_department_students(
    db: Session,
    department_profile_id: UUID,
):

    return (
        db.query(StudentProfile)
        .filter(
            StudentProfile.department_profile_id
            == department_profile_id
        )
        .order_by(StudentProfile.full_name)
        .all()
    )

def get_department_student_detail(
    db: Session,
    department_profile_id: UUID,
    student_profile_id: UUID,
):
    student = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.id == student_profile_id,
            StudentProfile.department_profile_id
            == department_profile_id,
        )
        .first()
    )

    if not student:
        return None

    rows = (
        db.query(
            TestAssignment,
            Test,
            TestResult,
        )
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .outerjoin(
            TestResult,
            TestResult.assignment_id
            == TestAssignment.id,
        )
        .filter(
            TestAssignment.student_profile_id
            == student.id,
            Test.target_department_id
            == department_profile_id,
        )
        .order_by(Test.created_at.desc())
        .all()
    )

    test_history = []

    percentages = []

    for assignment, test, result in rows:

        score = None
        percentage = None

        if result:
            score = result.obtained_marks
            percentage = result.percentage

            if percentage is not None:
                percentages.append(percentage)

        test_history.append(
            {
                "assignment_id": assignment.id,
                "test_id": test.id,
                "test_title": test.title,
                "test_mode": test.mode.value,
                "status": assignment.status.value,
                "started_at": assignment.started_at,
                "submitted_at": assignment.submitted_at,
                "score": score,
                "percentage": percentage,
            }
        )

    completed_tests = sum(
        1
        for record in test_history
        if record["status"] == "SUBMITTED"
    )

    in_progress_tests = sum(
        1
        for record in test_history
        if record["status"] == "IN_PROGRESS"
    )

    missed_tests = sum(
        1
        for record in test_history
        if record["status"] == "MISSED"
    )

    average_percentage = (
        sum(percentages) / len(percentages)
        if percentages
        else None
    )

    performance = {
        "total_tests": len(test_history),
        "completed_tests": completed_tests,
        "in_progress_tests": in_progress_tests,
        "missed_tests": missed_tests,
        "average_percentage": average_percentage,
    }

    student_data = {
        "user_id": student.user_id,
        "profile_id": student.id,
        "full_name": student.full_name,
        "college_email": student.college_email,
        "personal_email": student.personal_email,
        "phone_number": student.phone_number,
        "date_of_birth": (
            student.date_of_birth.isoformat()
            if student.date_of_birth
            else None
        ),
        "gender": student.gender,
        "exam_roll_number": student.exam_roll_number,
        "degree": student.degree,
        "batch_year": student.batch_year,
        "graduation_year": student.graduation_year,
    }

    return {
        "student": student_data,
        "test_history": test_history,
        "performance": performance,
    }

def get_department_tests(
    db: Session,
    department_profile_id: UUID,
):

    return (
        db.query(Test)
        .filter(
            Test.target_department_id
            == department_profile_id
        )
        .order_by(Test.created_at.desc())
        .all()
    )


def get_department_dashboard(
    db: Session,
    department_profile_id: UUID,
):
    # -----------------------------
    # Basic test/student counts
    # -----------------------------

    total_students = (
        db.query(func.count(StudentProfile.id))
        .filter(
            StudentProfile.department_profile_id
            == department_profile_id
        )
        .scalar()
        or 0
    )

    total_tests = (
        db.query(func.count(Test.id))
        .filter(
            Test.target_department_id
            == department_profile_id
        )
        .scalar()
        or 0
    )

    draft_tests = (
        db.query(func.count(Test.id))
        .filter(
            Test.target_department_id
            == department_profile_id,
            Test.status == "DRAFT",
        )
        .scalar()
        or 0
    )

    released_tests = (
        db.query(func.count(Test.id))
        .filter(
            Test.target_department_id
            == department_profile_id,
            Test.status == "RELEASED",
        )
        .scalar()
        or 0
    )

    closed_tests = (
        db.query(func.count(Test.id))
        .filter(
            Test.target_department_id
            == department_profile_id,
            Test.status == "CLOSED",
        )
        .scalar()
        or 0
    )

    # -----------------------------
    # Assignment counts
    # -----------------------------

    total_assignments = (
        db.query(func.count(TestAssignment.id))
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .filter(
            Test.target_department_id
            == department_profile_id,
        )
        .scalar()
        or 0
    )

    submitted_assignments = (
        db.query(func.count(TestAssignment.id))
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestAssignment.status == "SUBMITTED",
        )
        .scalar()
        or 0
    )

    in_progress_assignments = (
        db.query(func.count(TestAssignment.id))
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestAssignment.status == "IN_PROGRESS",
        )
        .scalar()
        or 0
    )

    missed_assignments = (
        db.query(func.count(TestAssignment.id))
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestAssignment.status == "MISSED",
        )
        .scalar()
        or 0
    )

    # -----------------------------
    # Average percentage
    # -----------------------------

    average_percentage = (
        db.query(func.avg(TestResult.percentage))
        .join(
            TestAssignment,
            TestAssignment.id == TestResult.assignment_id,
        )
        .join(
            Test,
            Test.id == TestAssignment.test_id,
        )
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestResult.percentage.isnot(None),
        )
        .scalar()
    )

    if average_percentage is not None:
        average_percentage = round(
            float(average_percentage),
            2,
        )

    # -----------------------------
    # Recent tests
    # -----------------------------

    recent_tests = (
        db.query(Test)
        .filter(
            Test.target_department_id
            == department_profile_id,
        )
        .order_by(
            Test.created_at.desc()
        )
        .limit(10)
        .all()
    )

    recent_test_summaries = []

    for test in recent_tests:

        assigned_count = (
            db.query(func.count(TestAssignment.id))
            .filter(
                TestAssignment.test_id == test.id,
            )
            .scalar()
            or 0
        )

        submitted_count = (
            db.query(func.count(TestAssignment.id))
            .filter(
                TestAssignment.test_id == test.id,
                TestAssignment.status == "SUBMITTED",
            )
            .scalar()
            or 0
        )

        missed_count = (
            db.query(func.count(TestAssignment.id))
            .filter(
                TestAssignment.test_id == test.id,
                TestAssignment.status == "MISSED",
            )
            .scalar()
            or 0
        )

        recent_test_summaries.append(
            {
                "id": test.id,
                "title": test.title,
                "mode": test.mode.value,
                "status": test.status.value,
                "created_at": test.created_at,
                "released_at": test.released_at,
                "assigned_count": assigned_count,
                "submitted_count": submitted_count,
                "missed_count": missed_count,
            }
        )

    return {
        "total_students": total_students,
        "total_tests": total_tests,
        "draft_tests": draft_tests,
        "released_tests": released_tests,
        "closed_tests": closed_tests,

        "total_assignments": total_assignments,
        "submitted_assignments": submitted_assignments,
        "in_progress_assignments": in_progress_assignments,
        "missed_assignments": missed_assignments,

        "average_percentage": average_percentage,

        "recent_tests": recent_test_summaries,
    }

def close_department_test(
    db: Session,
    department_profile_id: UUID,
    test_id: UUID,
):
    test = (
        db.query(Test)
        .filter(
            Test.id == test_id,
            Test.target_department_id == department_profile_id,
        )
        .first()
    )

    if not test:
        return None

    if test.status == "DRAFT":
        raise ValueError(
            "Draft tests cannot be closed. Release the test first."
        )

    if test.status == "CLOSED":
        raise ValueError(
            "This test is already closed."
        )

    test.status = "CLOSED"

    db.commit()
    db.refresh(test)

    return test