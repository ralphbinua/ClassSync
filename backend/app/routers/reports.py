from fastapi import APIRouter, HTTPException
from ..db import supabase
from ..errors import db_errors
from ..services.conflicts import scan_all_conflicts
from ..services.queries import fetch_schedules

router = APIRouter(tags=["reports"])


def _report(table: str, filter_key: str, item_id: int):
    with db_errors():
        entity = supabase.table(table).select("*").eq("id", item_id).execute().data
        if not entity:
            raise HTTPException(status_code=404, detail="Not found")
        return {
            "entity": entity[0],
            "schedules": fetch_schedules(**{filter_key: item_id}),
        }


@router.get("/reports/teacher/{item_id}")
def teacher_report(item_id: int):
    return _report("teachers", "teacher_id", item_id)


@router.get("/reports/room/{item_id}")
def room_report(item_id: int):
    return _report("rooms", "room_id", item_id)


@router.get("/reports/section/{item_id}")
def section_report(item_id: int):
    return _report("sections", "section_id", item_id)


@router.get("/conflicts")
def conflicts_report():
    with db_errors():
        found = scan_all_conflicts()
    return {"count": len(found), "conflicts": found}