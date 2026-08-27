from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.core.validators import validate_password
from app.models.enums import AccountStatus, UserRole
from app.models.user import User
from app.models.tpo_profile import TPOProfile
from app.models.department_profile import DepartmentProfile
from app.models.student_profile import StudentProfile
from app.core.config import settings


from datetime import datetime, timedelta, timezone

from app.models.auth_log import AuthLog
from app.models.auth_session import AuthSession
from app.models.enums import (
    AccountStatus,
    AuthEventType,
)
from app.core.security import (
    create_access_token,
    verify_password,
)


def check_email_available(
    db: Session,
    email: str,
) -> None:

    normalized_email = email.strip().lower()

    existing_user = db.scalar(
        select(User).where(
            User.email == normalized_email,
            User.status != AccountStatus.REJECTED,
        )
    )

    if existing_user:
        raise ValueError(
            "An account with this email already exists."
        )


def validate_registration_password(
    password: str,
) -> None:

    error = validate_password(password)

    if error:
        raise ValueError(error)

def register_tpo(
    db: Session,
    data,
) -> User:

    email = data.email.strip().lower()

    check_email_available(db, email)

    validate_registration_password(data.password)

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        role=UserRole.TPO,
        status=AccountStatus.PENDING,
    )

    db.add(user)
    db.flush()

    profile = TPOProfile(
        user_id=user.id,
        officer_name=data.officer_name.strip(),
        college_name=data.college_name.strip(),
        college_email=str(data.college_email).lower(),
        contact_number=data.contact_number.strip(),
        pincode=data.pincode.strip(),
        city=data.city.strip(),
        state=data.state.strip(),
        college_website=(
            data.college_website.strip()
            if data.college_website
            else None
        ),
    )

    try:
        db.add(profile)
        db.commit()
        db.refresh(user)
    
    except Exception:
        db.rollback()
        raise
    
    return user

def register_department(
    db: Session,
    data,
) -> User:

    email = data.email.strip().lower()

    check_email_available(db, email)

    validate_registration_password(data.password)

    tpo_profile = db.get(
        TPOProfile,
        data.tpo_profile_id,
    )

    if not tpo_profile:
        raise ValueError(
            "The selected TPO does not exist."
        )

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        role=UserRole.DEPARTMENT,
        status=AccountStatus.PENDING,
    )

    db.add(user)
    db.flush()

    profile = DepartmentProfile(
        user_id=user.id,
        tpo_profile_id=tpo_profile.id,
        officer_name=data.officer_name.strip(),
        officer_email=str(data.officer_email).lower(),
        officer_contact=data.officer_contact.strip(),
        department_name=data.department_name.strip(),
    )

    try:
        db.add(profile)
        db.commit()
        db.refresh(user)
    
    except Exception:
        db.rollback()
        raise
    
    return user


def register_student(
    db: Session,
    data,
) -> User:

    login_email = str(data.college_email).strip().lower()

    check_email_available(db, login_email)

    validate_registration_password(data.password)

    department = db.get(
        DepartmentProfile,
        data.department_profile_id,
    )

    if not department:
        raise ValueError(
            "The selected department does not exist."
        )

    user = User(
        email=login_email,
        password_hash=hash_password(data.password),
        role=UserRole.STUDENT,
        status=AccountStatus.APPROVED,
    )

    db.add(user)
    db.flush()

    profile = StudentProfile(
        user_id=user.id,
        department_profile_id=department.id,
        full_name=data.full_name.strip(),
        college_email=login_email,
        personal_email=str(data.personal_email).lower(),
        phone_number=data.phone_number.strip(),
        date_of_birth=data.date_of_birth,
        gender=data.gender.strip(),
        exam_roll_number=data.exam_roll_number.strip(),
        degree=data.degree.strip(),
        batch_year=data.batch_year,
        graduation_year=data.graduation_year,
    )

    try:
        db.add(profile)
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return user




def login_user(
    db: Session,
    email: str,
    password: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    normalized_email = email.strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == normalized_email,
            User.status != AccountStatus.REJECTED,
        )
    )

    # IMPORTANT:
    # We deliberately do not create an auth log
    # when the email does not exist.
    if not user:
        raise ValueError("Invalid email or password.")

    if not verify_password(
        password,
        user.password_hash,
    ):
        db.add(
            AuthLog(
                user_id=user.id,
                event_type=AuthEventType.LOGIN,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                failure_reason="INVALID_PASSWORD",
            )
        )

        db.commit()

        raise ValueError("Invalid email or password.")

    if user.status == AccountStatus.PENDING:

        db.add(
            AuthLog(
                user_id=user.id,
                event_type=AuthEventType.LOGIN,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                failure_reason="ACCOUNT_PENDING",
            )
        )

        db.commit()

        raise ValueError(
            "Your account is pending approval."
        )

    if user.status == AccountStatus.DISABLED:

        db.add(
            AuthLog(
                user_id=user.id,
                event_type=AuthEventType.LOGIN,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                failure_reason="ACCOUNT_DISABLED",
            )
        )

        db.commit()

        raise ValueError(
            "Your account has been disabled."
        )

    if user.status != AccountStatus.APPROVED:

        db.add(
            AuthLog(
                user_id=user.id,
                event_type=AuthEventType.LOGIN,
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                failure_reason="ACCOUNT_NOT_APPROVED",
            )
        )

        db.commit()

        raise ValueError(
            "Your account cannot login at this time."
        )

    # --------------------------------------------------
    # Successful login
    # --------------------------------------------------

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.JWT_EXPIRE_MINUTES
        )
    )

    session = AuthSession(
        user_id=user.id,
        expires_at=expires_at,
        ip_address=ip_address,
        user_agent=user_agent,
    )

    db.add(session)

    db.flush()

    token = create_access_token(
        user_id=user.id,
        session_id=session.id,
        expires_delta=timedelta(
            minutes=settings.JWT_EXPIRE_MINUTES
        ),
    )

    user.last_login_at = datetime.now(timezone.utc)

    db.add(
        AuthLog(
            user_id=user.id,
            event_type=AuthEventType.LOGIN,
            success=True,
            ip_address=ip_address,
            user_agent=user_agent,
        )
    )

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()
        raise

    return user, token

def logout_user(
    db: Session,
    user: User,
    session_id,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:

    session = db.scalar(
        select(AuthSession).where(
            AuthSession.id == session_id,
            AuthSession.user_id == user.id,
        )
    )

    if not session:
        return

    if session.logged_out_at is None:

        now = datetime.now(timezone.utc)

        session.logged_out_at = now
        session.last_activity_at = now

        db.add(
            AuthLog(
                user_id=user.id,
                event_type=AuthEventType.LOGOUT,
                success=True,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        )

        db.commit()