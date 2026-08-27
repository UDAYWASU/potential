from datetime import date
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import UserRole


class TPORegisterRequest(BaseModel):
    role: UserRole = UserRole.TPO

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    officer_name: str = Field(min_length=1, max_length=150)
    college_name: str = Field(min_length=1, max_length=255)
    college_email: EmailStr
    contact_number: str = Field(min_length=5, max_length=30)
    pincode: str = Field(min_length=4, max_length=10)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    college_website: str | None = Field(
        default=None,
        max_length=500,
    )


class DepartmentRegisterRequest(BaseModel):
    role: UserRole = UserRole.DEPARTMENT

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    tpo_profile_id: UUID

    officer_name: str = Field(min_length=1, max_length=150)
    officer_email: EmailStr
    officer_contact: str = Field(min_length=5, max_length=30)
    department_name: str = Field(min_length=1, max_length=150)


class StudentRegisterRequest(BaseModel):
    role: UserRole = UserRole.STUDENT

    college_email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    full_name: str = Field(min_length=1, max_length=150)
    personal_email: EmailStr
    phone_number: str = Field(min_length=5, max_length=30)
    date_of_birth: date
    gender: str = Field(min_length=1, max_length=30)
    exam_roll_number: str = Field(min_length=1, max_length=100)
    department_profile_id: UUID
    degree: str = Field(min_length=1, max_length=150)
    batch_year: int
    graduation_year: int


class RegisterResponse(BaseModel):
    message: str
    user_id: UUID
    status: str





class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=1,
        max_length=128,
    )


class LoginResponse(BaseModel):
    message: str
    user_id: UUID
    role: str
    status: str

class CurrentUserResponse(BaseModel):
    user_id: UUID
    email: str
    role: str
    status: str