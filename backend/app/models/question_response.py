# app/models/question_response.py

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class QuestionResponse(Base):
    __tablename__ = "question_responses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    assignment_question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assignment_questions.id", ondelete="CASCADE"),
        nullable=False,
    )

    answer: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    is_correct: Mapped[bool | None] = mapped_column(
        Boolean,
        nullable=True,
    )

    marks_obtained: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    time_taken_seconds: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )