from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class AutomaticQuestionRequirement(BaseModel):
    subject: str
    topic: str | None = None
    subtopic: str | None = None
    difficulty: str
    question_type: str | None = None
    count: int = Field(gt=0)
    marks: float = Field(gt=0)


class AutomaticTestConfig(BaseModel):
    requirements: list[AutomaticQuestionRequirement]


class ManualQuestion(BaseModel):
    question_content: dict
    answer: dict | None = None
    marks: float = Field(gt=0)


class CreateTestRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)

    mode: str

    duration_minutes: int | None = Field(
        default=None,
        gt=0,
    )

    configuration: AutomaticTestConfig | None = None

    manual_questions: list[ManualQuestion] | None = None

    adaptive_subjects: list[str] | None = None

    @model_validator(mode="after")
    def validate_mode_configuration(self):
        if self.mode == "AUTOMATIC":
            if not self.configuration:
                raise ValueError(
                    "configuration is required for automatic tests."
                )

        elif self.mode == "MANUAL":
            if not self.manual_questions:
                raise ValueError(
                    "manual_questions are required for manual tests."
                )

        elif self.mode == "ADAPTIVE":
            if not self.adaptive_subjects:
                raise ValueError(
                    "adaptive_subjects are required for adaptive tests."
                )

            self.duration_minutes = None

        else:
            raise ValueError("Invalid test mode.")

        return self


class CreateTestResponse(BaseModel):
    id: UUID
    title: str
    mode: str
    status: str
    message: str
    created_at: datetime
