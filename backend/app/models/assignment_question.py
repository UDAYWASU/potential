# app/models/assignment_question.py

import uuid

from sqlalchemy import ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AssignmentQuestion(Base):
    __tablename__ = "assignment_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    assignment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("test_assignments.id", ondelete="CASCADE"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Reference if question came from question bank.
    question_bank_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_bank.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Snapshot ensures historical test never changes.
    question_snapshot: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    marks: Mapped[float | None] = mapped_column(
        nullable=True,
    )