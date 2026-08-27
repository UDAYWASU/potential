import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

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

    department_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("department_profiles.id", ondelete="RESTRICT"),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    college_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    personal_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    phone_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    date_of_birth: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    gender: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    exam_roll_number: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    degree: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    batch_year: Mapped[int] = mapped_column(
        nullable=False,
    )

    graduation_year: Mapped[int] = mapped_column(
        nullable=False,
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="student_profile",
    )

    department = relationship(
        "DepartmentProfile",
        foreign_keys=[department_profile_id],
        back_populates="students",
    )