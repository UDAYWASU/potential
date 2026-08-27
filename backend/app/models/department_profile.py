import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DepartmentProfile(Base):
    __tablename__ = "department_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    tpo_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tpo_profiles.id", ondelete="RESTRICT"),
        nullable=False,
    )

    officer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    officer_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    officer_contact: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    department_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="department_profile",
    )

    tpo = relationship(
        "TPOProfile",
        foreign_keys=[tpo_profile_id],
        back_populates="departments",
    )

    students = relationship(
        "StudentProfile",
        back_populates="department",
    )