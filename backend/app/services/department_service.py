from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.department_profile import DepartmentProfile
from app.models.student_profile import StudentProfile
from app.models.test import Test
from app.models.test_assignment import TestAssignment
from app.models.test_result import TestResult


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

    active_tests = (
        db.query(func.count(Test.id))
        .filter(
            Test.target_department_id
            == department_profile_id,
            Test.status == "RELEASED",
        )
        .scalar()
        or 0
    )

    completed_tests = (
        db.query(func.count(TestAssignment.id))
        .join(Test)
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestAssignment.status == "SUBMITTED",
        )
        .scalar()
        or 0
    )

    pending_result_release = (
        db.query(func.count(TestResult.id))
        .join(TestAssignment)
        .join(Test)
        .filter(
            Test.target_department_id
            == department_profile_id,
            TestResult.released.is_(False),
        )
        .scalar()
        or 0
    )

    return {
        "total_students": total_students,
        "total_tests": total_tests,
        "active_tests": active_tests,
        "completed_tests": completed_tests,
        "pending_result_release": pending_result_release,
    }

