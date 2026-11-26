from pydantic import BaseModel, ConfigDict, Field


class SubjectIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    subject_code: str = Field(min_length=1)
    subject_name: str = Field(min_length=1)
    units: float | None = None
    description: str | None = None