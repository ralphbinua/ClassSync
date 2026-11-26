from contextlib import contextmanager
from fastapi import HTTPException
from postgrest.exceptions import APIError

_MESSAGES = {
    "23P01": (409, "Schedule conflict: this teacher, room, or section is already booked at that time."),
    "23505": (409, "Duplicate value: a record with that unique value already exists."),
    "23503": (409, "Blocked: this record is in use by other records (or points to one that doesn't exist)."),
    "23514": (422, "Invalid value: a database rule was violated."),
}


@contextmanager
def db_errors():
    try:
        yield
    except APIError as e:
        status, message = _MESSAGES.get(
            getattr(e, "code", None), (500, "Database error")
        )
        raise HTTPException(status_code=status, detail=message)