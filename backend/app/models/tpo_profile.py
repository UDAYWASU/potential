import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TPOProfile(Base):
    __tablename__ = "tpo_profiles"

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

    officer_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    college_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    college_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    contact_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    pincode: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    state: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    college_website: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="tpo_profile",
    )

    departments = relationship(
        "DepartmentProfile",
        back_populates="tpo",
    )