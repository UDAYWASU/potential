# app/models/test_question.py

import uuid

from sqlalchemy import ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TestQuestion(Base):
    __tablename__ = "test_questions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tests.id", ondelete="CASCADE"),
        nullable=False,
    )

    sequence_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Used for manual questions.
    question_content: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    answer: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    marks: Mapped[float | None] = mapped_column(
        nullable=True,
    )

    question_metadata: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )