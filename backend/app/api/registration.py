from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.registration import (
    DepartmentRegistrationLookup,
    DepartmentRegistrationLookupResponse,
    TPORegistrationLookup,
    TPORegistrationLookupResponse,
)
from app.services.registration_service import (
    get_registration_departments,
    get_registration_tpos,
)


router = APIRouter(
    prefix="/api/registration",
    tags=["Registration"],
)


@router.get(
    "/tpos",
    response_model=TPORegistrationLookupResponse,
)
def get_tpos_for_registration(
    db: Session = Depends(get_db),
):
    tpos = get_registration_tpos(db)

    return TPORegistrationLookupResponse(
        tpos=[
            TPORegistrationLookup(
                id=tpo.id,
                officer_name=tpo.officer_name,
                college_name=tpo.college_name,
                college_email=tpo.college_email,
                city=tpo.city,
                state=tpo.state,
            )
            for tpo in tpos
        ]
    )


@router.get(
    "/departments",
    response_model=DepartmentRegistrationLookupResponse,
)
def get_departments_for_registration(
    db: Session = Depends(get_db),
):
    departments = get_registration_departments(db)

    return DepartmentRegistrationLookupResponse(
        departments=[
            DepartmentRegistrationLookup(
                id=department.id,
                department_name=department.department_name,
                officer_name=department.officer_name,
                college_name=tpo.college_name,
                tpo_name=tpo.officer_name,
                tpo_profile_id=tpo.id,
            )
            for department, tpo in departments
        ]
    )