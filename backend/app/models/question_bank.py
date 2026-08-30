# app/models/question_bank.py

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, JSON, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole


class QuestionType(str, enum.Enum):
    WRITTEN = "WRITTEN"
    CODING = "CODING"
    SPOKEN = "SPOKEN"
    MCQ = "MCQ"


class DifficultyLevel(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"



class QuestionBank(Base):
    __tablename__ = "question_bank"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    tpo_profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tpo_profiles.id", ondelete="RESTRICT"),
        nullable=False,
    )

    subject: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    topic: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    subtopic: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, name="question_type"),
        nullable=False,
    )

    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel, name="difficulty_level"),
        nullable=False,
    )

    # Text/image/audio/etc.
    question_content: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    # Correct answer / expected answer / options etc.
    answer: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )