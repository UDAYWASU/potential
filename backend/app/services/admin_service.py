from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.enums import AccountStatus, UserRole
from app.models.user import User


def create_admin_if_not_exists(db: Session) -> None:
    existing_admin = db.scalar(
        select(User).where(
            User.role == UserRole.ADMIN
        )
    )

    if existing_admin:
        return

    admin = User(
        email=settings.ADMIN_EMAIL.strip().lower(),
        password_hash=hash_password(
            settings.ADMIN_PASSWORD
        ),
        role=UserRole.ADMIN,
        status=AccountStatus.APPROVED,
    )

    db.add(admin)
    db.commit()