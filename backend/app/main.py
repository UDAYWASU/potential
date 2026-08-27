from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine, SessionLocal
from app.services.admin_service import create_admin_if_not_exists

from app.api.auth import router as auth_router

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):

    db = SessionLocal()

    try:
        create_admin_if_not_exists(db)
        yield
    finally:
        db.close()


app = FastAPI(
    title="Potential",
    lifespan=lifespan,
)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Potential API is running"
    }


@app.get("/health/db")
def database_health():

    with engine.connect() as connection:

        result = connection.execute(
            text("SELECT 1")
        )

        return {
            "database": "connected",
            "result": result.scalar(),
        }