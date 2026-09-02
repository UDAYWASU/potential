from datetime import date,datetime
from uuid import UUID

from pydantic import BaseModel


class StudentProfileResponse(BaseModel):
    user_id: UUID
    profile_id: UUID

    full_name: str
    college_email: str
    personal_email: str
    phone_number: str
    date_of_birth: date
    gender: str
    exam_roll_number: str

    degree: str
    batch_year: int
    graduation_year: int

    department_profile_id: UUID


class StudentTestAssignmentResponse(BaseModel):
    assignment_id: UUID
    test_id: UUID

    title: str
    description: str | None

    mode: str
    duration_minutes: int | None

    status: str

    assigned_at: datetime
    started_at: datetime | None
    submitted_at: datetime | None

    released_at: datetime | None


class StudentTestsResponse(BaseModel):
    tests: list[StudentTestAssignmentResponse]


# ============================================================
# 4C — TEST ATTEMPT
# ============================================================

class StudentAttemptQuestionResponse(BaseModel):
    question_id: UUID
    sequence_number: int

    question: dict
    marks: float | None

    answer: dict | None
    is_answered: bool


class StudentTestAttemptResponse(BaseModel):
    assignment_id: UUID
    test_id: UUID

    title: str
    description: str | None

    mode: str
    duration_minutes: int | None

    status: str

    started_at: datetime | None
    submitted_at: datetime | None

    questions: list[StudentAttemptQuestionResponse]


class StudentAnswerRequest(BaseModel):
    answer: dict | None


class StudentAnswerResponse(BaseModel):
    message: str
    question_id: UUID
    answer: dict | None


class StudentSubmitResponse(BaseModel):
    message: str
    assignment_id: UUID
    status: str
    submitted_at: datetime