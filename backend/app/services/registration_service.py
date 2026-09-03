from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.department_profile import DepartmentProfile
from app.models.enums import AccountStatus, UserRole
from app.models.tpo_profile import TPOProfile
from app.models.user import User


def get_registration_tpos(
    db: Session,
) -> list[TPOProfile]:
    """
    Return approved TPO profiles that can be selected
    during department registration.
    """

    result = db.scalars(
        select(TPOProfile)
        .join(User, User.id == TPOProfile.user_id)
        .where(
            User.role == UserRole.TPO,
            User.status == AccountStatus.APPROVED,
        )
        .order_by(
            TPOProfile.college_name.asc(),
            TPOProfile.officer_name.asc(),
        )
    )

    return result.all()


def get_registration_departments(
    db: Session,
) -> list[tuple[DepartmentProfile, TPOProfile]]:
    """
    Return approved departments together with their TPO.
    """

    result = db.execute(
        select(
            DepartmentProfile,
            TPOProfile,
        )
        .join(
            User,
            User.id == DepartmentProfile.user_id,
        )
        .join(
            TPOProfile,
            TPOProfile.id == DepartmentProfile.tpo_profile_id,
        )
        .where(
            User.role == UserRole.DEPARTMENT,
            User.status == AccountStatus.APPROVED,
        )
        .order_by(
            DepartmentProfile.department_name.asc(),
            TPOProfile.college_name.asc(),
        )
    )

    return result.all()