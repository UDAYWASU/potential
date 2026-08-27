from datetime import datetime, timezone
from uuid import UUID

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.auth_session import AuthSession
from app.models.user import User
from app.models.enums import AccountStatus


def get_current_user(
    potential_access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:

    if not potential_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    # -----------------------------------------
    # Decode JWT
    # -----------------------------------------

    try:
        payload = decode_access_token(
            potential_access_token
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )

    user_id = payload.get("sub")
    session_id = payload.get("sid")

    if not user_id or not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    try:
        user_uuid = UUID(user_id)
        session_uuid = UUID(session_id)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    # -----------------------------------------
    # Find session
    # -----------------------------------------

    session = db.scalar(
        select(AuthSession).where(
            AuthSession.id == session_uuid,
            AuthSession.user_id == user_uuid,
        )
    )

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session is no longer valid.",
        )

    # -----------------------------------------
    # Check logout
    # -----------------------------------------

    if session.logged_out_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has been logged out.",
        )

    # -----------------------------------------
    # Check session expiry
    # -----------------------------------------

    now = datetime.now(timezone.utc)

    if session.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired.",
        )

    # -----------------------------------------
    # Find user
    # -----------------------------------------

    user = db.get(User, user_uuid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )

    # -----------------------------------------
    # Check account status
    # -----------------------------------------

    if user.status != AccountStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is not active.",
        )

    # -----------------------------------------
    # Update last activity
    # -----------------------------------------

    session.last_activity_at = now

    db.commit()

    return user

from fastapi import HTTPException, status

from app.models.enums import UserRole
from app.models.user import User


def require_role(required_role: UserRole):
    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource.",
            )

        return current_user

    return role_checker


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return current_user


def require_tpo(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.TPO:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="TPO access required.",
        )

    return current_user


def require_department(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.DEPARTMENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Department access required.",
        )

    return current_user


def require_student(
    current_user: User = Depends(get_current_user),
) -> User:

    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student access required.",
        )

    return current_user