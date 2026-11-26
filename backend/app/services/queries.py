from ..db import supabase

DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

JOIN = (
    "*, subjects(subject_code, subject_name), teachers(first_name, last_name), "
    "rooms(room_number), sections(grade_level, section_name)"
)


def flatten(r: dict) -> dict:
    """Turn a joined row into the 8 required display fields (plus ids)."""
    s, t, ro, se = r["subjects"], r["teachers"], r["rooms"], r["sections"]
    return {
        "id": r["id"],
        "subject_id": r["subject_id"],
        "teacher_id": r["teacher_id"],
        "room_id": r["room_id"],
        "section_id": r["section_id"],
        "subject_code": s["subject_code"],
        "subject_name": s["subject_name"],
        "teacher_name": f'{t["first_name"]} {t["last_name"]}',
        "room_number": ro["room_number"],
        "grade_section": f'{se["grade_level"]} - {se["section_name"]}',
        "day": r["day"],
        "day_name": DAYS[r["day"]],
        "start_time": r["start_time"][:5],
        "end_time": r["end_time"][:5],
    }


def _haystack(f: dict) -> str:
    return " ".join([
        f["subject_code"], f["subject_name"], f["teacher_name"],
        f["room_number"], f["grade_section"], f["day_name"],
    ]).lower()


def fetch_schedules(teacher_id=None, room_id=None, subject_id=None,
                    section_id=None, day=None, q=None) -> list[dict]:
    query = supabase.table("schedules").select(JOIN)
    for col, val in (("teacher_id", teacher_id), ("room_id", room_id),
                     ("subject_id", subject_id), ("section_id", section_id),
                     ("day", day)):
        if val is not None:
            query = query.eq(col, val)
    rows = [flatten(r) for r in query.order("day").order("start_time").execute().data]
    if q:
        needle = q.strip().lower()
        rows = [r for r in rows if needle in _haystack(r)]
    return rows


def fetch_schedule(schedule_id: int) -> dict | None:
    data = supabase.table("schedules").select(JOIN).eq("id", schedule_id).execute().data
    return flatten(data[0]) if data else None