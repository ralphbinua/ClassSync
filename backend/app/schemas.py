from pydantic import BaseModel, ConfigDict, Field


class Base(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class SubjectIn(Base):
    subject_code: str = Field(min_length=1)
    subject_name: str = Field(min_length=1)
    units: float | None = None
    description: str | None = None


class TeacherIn(Base):
    teacher_id_no: str = Field(min_length=1)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: str | None = None
    department: str | None = None


class RoomIn(Base):
    room_number: str = Field(min_length=1)
    building: str | None = None
    capacity: int | None = Field(default=None, gt=0)
    room_type: str | None = None


class SectionIn(Base):
    grade_level: str = Field(min_length=1)
    section_name: str = Field(min_length=1)