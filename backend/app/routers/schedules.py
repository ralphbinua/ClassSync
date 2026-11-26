from fastapi import APIRouter, HTTPException
from ..db import supabase
from ..errors import db_errors
from ..schemas import ScheduleIn, ScheduleCheckIn
from ..services.conflicts import find_conflicts
from ..services.queries import fetch_schedules, fetch_schedule

router = APIRouter(prefix="/schedules", tags=["schedules"])


def _block_if_conflict(p: ScheduleIn, exclude_id: int | None = None):
    conflicts = find_conflicts(p.day, p.start_time, p.end_time,
                               p.teacher_id, p.room_id, p.section_id, exclude_id)
    if conflicts:
        raise HTTPException(
            status_code=409,
            detail={"message": "Schedule conflict detected. Not saved.",
                    "conflicts": conflicts},
        )


@router.get("")
def list_schedules(teacher_id: int | None = None, room_id: int | None = None,
                   subject_id: int | None = None, section_id: int | None = None,
                   day: int | None = None, q: str | None = None):
    with db_errors():
        return fetch_schedules(teacher_id, room_id, subject_id, section_id, day, q)


@router.post("/check-conflict")
def check_conflict(p: ScheduleCheckIn):
    """Checks only. Saves nothing."""
    with db_errors():
        conflicts = find_conflicts(p.day, p.start_time, p.end_time,
                                   p.teacher_id, p.room_id, p.section_id, p.exclude_id)
    return {"has_conflict": bool(conflicts), "conflicts": conflicts}


@router.get("/{schedule_id}")
def get_schedule(schedule_id: int):
    with db_errors():
        row = fetch_schedule(schedule_id)
    if not row:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return row


@router.post("", status_code=201)
def create_schedule(p: ScheduleIn):
    with db_errors():
        _block_if_conflict(p)                                   # layer 1: friendly check
        res = supabase.table("schedules").insert(p.model_dump(mode="json")).execute()  # layer 2: DB constraint
        return fetch_schedule(res.data[0]["id"])


@router.put("/{schedule_id}")
def update_schedule(schedule_id: int, p: ScheduleIn):
    with db_errors():
        if not fetch_schedule(schedule_id):
            raise HTTPException(status_code=404, detail="Schedule not found")
        _block_if_conflict(p, exclude_id=schedule_id)
        supabase.table("schedules").update(p.model_dump(mode="json")).eq("id", schedule_id).execute()
        return fetch_schedule(schedule_id)


@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int):
    with db_errors():
        rows = supabase.table("schedules").delete().eq("id", schedule_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"deleted": schedule_id}