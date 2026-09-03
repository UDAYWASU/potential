from uuid import UUID

from pydantic import BaseModel


class TPORegistrationLookup(BaseModel):
    id: UUID
    officer_name: str
    college_name: str
    college_email: str
    city: str
    state: str


class TPORegistrationLookupResponse(BaseModel):
    tpos: list[TPORegistrationLookup]


class DepartmentRegistrationLookup(BaseModel):
    id: UUID
    department_name: str
    officer_name: str
    college_name: str
    tpo_name: str
    tpo_profile_id: UUID


class DepartmentRegistrationLookupResponse(BaseModel):
    departments: list[DepartmentRegistrationLookup]