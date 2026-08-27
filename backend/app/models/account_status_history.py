import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import AccountStatus


class AccountStatusHistory(Base):
    __tablename__ = "account_status_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    old_status: Mapped[AccountStatus | None] = mapped_column(
        Enum(AccountStatus, name="account_status"),
        nullable=True,
    )

    new_status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status"),
        nullable=False,
    )

    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
    )

    changed_by_user = relationship(
        "User",
        foreign_keys=[changed_by],
    )