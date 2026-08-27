from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.auth import (
    TPORegisterRequest,
    DepartmentRegisterRequest,
    StudentRegisterRequest,
    RegisterResponse,
)
from app.core.security import decode_access_token
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import CurrentUserResponse
from app.services.auth_service import (
    register_tpo,
    register_department,
    register_student,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)

from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
)

from app.services.auth_service import login_user

from uuid import UUID

from fastapi import Cookie

from app.services.auth_service import logout_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register/tpo",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_tpo_account(
    data: TPORegisterRequest,
    db: Session = Depends(get_db),
):

    try:
        user = register_tpo(db, data)

        return RegisterResponse(
            message=(
                "TPO registration submitted successfully. "
                "Your account is pending admin approval."
            ),
            user_id=user.id,
            status=user.status.value,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

@router.post(
    "/register/department",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_department_account(
    data: DepartmentRegisterRequest,
    db: Session = Depends(get_db),
):

    try:
        user = register_department(db, data)

        return RegisterResponse(
            message=(
                "Department registration submitted successfully. "
                "Your account is pending TPO approval."
            ),
            user_id=user.id,
            status=user.status.value,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

@router.post(
    "/register/student",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_student_account(
    data: StudentRegisterRequest,
    db: Session = Depends(get_db),
):

    try:
        user = register_student(db, data)

        return RegisterResponse(
            message="Student account created successfully.",
            user_id=user.id,
            status=user.status.value,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )




@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):

    client_ip = None

    if request.client:
        client_ip = request.client.host

    user_agent = request.headers.get(
        "user-agent"
    )

    try:

        user, token = login_user(
            db=db,
            email=data.email,
            password=data.password,
            ip_address=client_ip,
            user_agent=user_agent,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    response.set_cookie(
        key="potential_access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.JWT_EXPIRE_MINUTES * 60,
    )

    return LoginResponse(
        message="Login successful.",
        user_id=user.id,
        role=user.role.value,
        status=user.status.value,
    )


@router.get(
    "/me",
    response_model=CurrentUserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return CurrentUserResponse(
        user_id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        status=current_user.status.value,
    )


@router.post(
    "/logout",
)
def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    potential_access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
):
    if potential_access_token:
        try:
            payload = decode_access_token(
                potential_access_token
            )

            session_id = payload.get("sid")

            if session_id:
                logout_user(
                    db=db,
                    user=current_user,
                    session_id=UUID(session_id),
                    ip_address=(
                        request.client.host
                        if request.client
                        else None
                    ),
                    user_agent=request.headers.get(
                        "user-agent"
                    ),
                )

        except Exception:
            pass

    response.delete_cookie(
        key="potential_access_token"
    )

    return {
        "message": "Logout successful."
    }
from app.api.dependencies import (
    get_current_user,
    require_admin,
)
@router.get("/test/admin")
def test_admin_access(
    current_user: User = Depends(require_admin),
):
    return {
        "message": "Admin access confirmed.",
        "user_id": str(current_user.id),
    }