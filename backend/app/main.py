from fastapi import FastAPI
from .routers import subjects

app = FastAPI(title="Class Scheduling API")

app.include_router(subjects.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}