from fastapi import FastAPI
from .schemas import SubjectIn, TeacherIn, RoomIn, SectionIn
from .routers.crud import make_crud_router

app = FastAPI(title="Class Scheduling API")

API = "/api"

app.include_router(
    make_crud_router("subjects", "Subject", SubjectIn,
                     "subject_code", ["subject_code", "subject_name"]),
    prefix=API,
)
app.include_router(
    make_crud_router("teachers", "Teacher", TeacherIn, "last_name",
                     ["first_name", "last_name", "teacher_id_no", "department"]),
    prefix=API,
)
app.include_router(
    make_crud_router("rooms", "Room", RoomIn, "room_number",
                     ["room_number", "building", "room_type"]),
    prefix=API,
)
app.include_router(
    make_crud_router("sections", "Section", SectionIn, "grade_level",
                     ["grade_level", "section_name"]),
    prefix=API,
)


@app.get("/health")
def health():
    return {"status": "ok"}