from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DepartmentProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    tpo_profile_id: UUID
    officer_name: str
    officer_email: str
    officer_contact: str
    department_name: str

    model_config = ConfigDict(from_attributes=True)


class DepartmentStudentResponse(BaseModel):
    user_id: UUID
    profile_id: UUID
    full_name: str
    college_email: str
    personal_email: str
    phone_number: str
    date_of_birth: str
    gender: str
    exam_roll_number: str
    degree: str
    batch_year: int
    graduation_year: int


class DepartmentTestResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    mode: str
    status: str
    duration_minutes: int | None
    created_at: datetime
    released_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class DepartmentDashboardResponse(BaseModel):
    total_students: int
    total_tests: int
    active_tests: int
    completed_tests: int
    pending_result_release: int


from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DepartmentProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    department_name: str

    class Config:
        from_attributes = True


class DepartmentStudentResponse(BaseModel):
    user_id: UUID
    profile_id: UUID
    full_name: str
    college_email: str
    personal_email: str | None = None
    phone_number: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    exam_roll_number: str | None = None
    degree: str | None = None
    batch_year: int | None = None
    graduation_year: int | None = None


class DepartmentStudentTestRecord(BaseModel):
    assignment_id: UUID
    test_id: UUID
    test_title: str
    test_mode: str
    status: str
    started_at: datetime | None = None
    submitted_at: datetime | None = None
    score: float | None = None
    percentage: float | None = None


class DepartmentStudentDetailResponse(BaseModel):
    student: DepartmentStudentResponse
    test_history: list[DepartmentStudentTestRecord]
    performance: dict


class DepartmentTestResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    mode: str
    status: str
    duration_minutes: int | None = None
    created_at: datetime
    released_at: datetime | None = None


class DepartmentTestDetailResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    mode: str
    status: str
    duration_minutes: int | None = None
    created_at: datetime
    released_at: datetime | None = None

    question_count: int
    assigned_count: int
    in_progress_count: int
    submitted_count: int
    missed_count: int


class DashboardTestSummary(BaseModel):
    id: UUID
    title: str
    mode: str
    status: str
    created_at: datetime
    released_at: datetime | None = None
    assigned_count: int
    submitted_count: int
    missed_count: int


class DepartmentDashboardResponse(BaseModel):
    total_students: int
    total_tests: int

    draft_tests: int
    released_tests: int
    closed_tests: int

    total_assignments: int
    submitted_assignments: int
    in_progress_assignments: int
    missed_assignments: int

    average_percentage: float | None = None

    recent_tests: list[DashboardTestSummary]


class DepartmentTestMonitorStudent(BaseModel):
    assignment_id: UUID
    student_profile_id: UUID
    student_name: str
    status: str
    started_at: datetime | None = None
    submitted_at: datetime | None = None


class DepartmentTestMonitorResponse(BaseModel):
    test_id: UUID
    test_title: str

    assigned_count: int
    in_progress_count: int
    submitted_count: int
    missed_count: int

    students: list[DepartmentTestMonitorStudent]


class DepartmentTestResultStudent(BaseModel):
    assignment_id: UUID
    student_profile_id: UUID
    student_name: str

    total_marks: float | None = None
    obtained_marks: float | None = None
    percentage: float | None = None

    llm_analysis_completed: bool
    released: bool
    released_at: datetime | None = None


class DepartmentTestResultsResponse(BaseModel):
    test_id: UUID
    test_title: str
    results: list[DepartmentTestResultStudent]