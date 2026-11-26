from .queries import JOIN, flatten, fetch_schedules
from datetime import time
from ..db import supabase

def scan_all_conflicts() -> list[dict]:
    """Compare every pair of stored schedules and report any overlaps."""
    rows = fetch_schedules()
    found = []
    for i, a in enumerate(rows):
        for b in rows[i + 1:]:
            if a["day"] != b["day"]:
                continue
            if not (a["start_time"] < b["end_time"] and a["end_time"] > b["start_time"]):
                continue
            for kind, key in (("teacher", "teacher_id"),
                              ("room", "room_id"),
                              ("section", "section_id")):
                if a[key] == b[key]:
                    found.append({"type": kind, "a": a, "b": b})
    return found

def _describe(kind: str, r: dict) -> str:
    who = {
        "teacher": r["teacher_name"],
        "room": f'Room {r["room_number"]}',
        "section": r["grade_section"],
    }[kind]
    return (
        f'{kind.capitalize()} conflict: {who} is already booked for '
        f'{r["subject_code"]} ({r["grade_section"]}, {r["teacher_name"]}, '
        f'Room {r["room_number"]}) on {r["day_name"]} '
        f'{r["start_time"]}-{r["end_time"]}'
    )


def find_conflicts(day: int, start: time, end: time, teacher_id: int,
                   room_id: int, section_id: int,
                   exclude_id: int | None = None) -> list[dict]:
    """Same day AND existing.start < new.end AND existing.end > new.start,
    for the same teacher, room, or section."""
    query = (
        supabase.table("schedules").select(JOIN)
        .eq("day", day)
        .lt("start_time", end.isoformat())      # existing starts before new ends
        .gt("end_time", start.isoformat())      # existing ends after new starts
        .or_(f"teacher_id.eq.{teacher_id},room_id.eq.{room_id},section_id.eq.{section_id}")
    )
    if exclude_id is not None:
        query = query.neq("id", exclude_id)

    conflicts = []
    for row in query.execute().data:
        r = flatten(row)
        for kind, key, value in (("teacher", "teacher_id", teacher_id),
                                 ("room", "room_id", room_id),
                                 ("section", "section_id", section_id)):
            if r[key] == value:
                conflicts.append({"type": kind, "message": _describe(kind, r), "schedule": r})
    return conflicts