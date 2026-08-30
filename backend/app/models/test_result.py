# app/models/test_result.py

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TestResult(Base):
    __tablename__ = "test_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("test_assignments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    total_marks: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    obtained_marks: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    percentage: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    # Future-proof result information.
    result_data: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    # LLM generated analysis/report.
    llm_report: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    llm_analysis_completed: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    released: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    released_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )