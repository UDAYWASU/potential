from uuid import UUID

from sqlalchemy.orm import Session

from app.models.department_profile import DepartmentProfile
from app.models.test import (
    Test,
    TestCreatorRole,
    TestMode,
    TestStatus,
)
from app.models.test_question import TestQuestion


def create_department_test(
    db: Session,
    department: DepartmentProfile,
    data,
    current_user_id: UUID,
):
    test = Test(
        title=data.title,
        description=data.description,
        mode=TestMode(data.mode),
        created_by=current_user_id,
        creator_role=TestCreatorRole.DEPARTMENT,
        target_department_id=department.id,
        target_tpo_id=None,
        duration_minutes=data.duration_minutes,
        status=TestStatus.DRAFT,
    )

    if data.mode == "AUTOMATIC":
        test.configuration = {
            "requirements": [
                rule.model_dump()
                for rule in data.configuration.requirements

            ]
        }

    elif data.mode == "ADAPTIVE":
        test.configuration = {
            "subjects": data.adaptive_subjects,
            "adaptive": True,
        }

    db.add(test)
    db.flush()

    if data.mode == "MANUAL":
        for index, question in enumerate(
            data.manual_questions,
            start=1,
        ):
            test_question = TestQuestion(
                test_id=test.id,
                sequence_number=index,
                question_content=question.question_content,
                answer=question.answer,
                marks=question.marks,
            )

            db.add(test_question)

    db.commit()
    db.refresh(test)

    return test