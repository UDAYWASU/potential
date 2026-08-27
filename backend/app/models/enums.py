import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TPO = "TPO"
    DEPARTMENT = "DEPARTMENT"
    STUDENT = "STUDENT"


class AccountStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    DISABLED = "DISABLED"


class AuthEventType(str, enum.Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"