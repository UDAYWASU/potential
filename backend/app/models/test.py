# app/models/test.py

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TestMode(str, enum.Enum):
    AUTOMATIC = "AUTOMATIC"
    MANUAL = "MANUAL"
    ADAPTIVE = "ADAPTIVE"


class TestStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    RELEASED = "RELEASED"
    CLOSED = "CLOSED"


class TestCreatorRole(str, enum.Enum):
    TPO = "TPO"
    DEPARTMENT = "DEPARTMENT"


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    mode: Mapped[TestMode] = mapped_column(
        Enum(TestMode, name="test_mode"),
        nullable=False,
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    creator_role: Mapped[TestCreatorRole] = mapped_column(
        Enum(TestCreatorRole, name="test_creator_role"),
        nullable=False,
    )

    # Department test
    target_department_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("department_profiles.id", ondelete="RESTRICT"),
        nullable=True,
    )

    # TPO test
    target_tpo_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tpo_profiles.id", ondelete="RESTRICT"),
        nullable=True,
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    # Automatic test configuration.
    # Adaptive configuration can also live here.
    configuration: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    status: Mapped[TestStatus] = mapped_column(
        Enum(TestStatus, name="test_status"),
        nullable=False,
        default=TestStatus.DRAFT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    released_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )