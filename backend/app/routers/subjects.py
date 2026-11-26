from fastapi import APIRouter, HTTPException
from ..db import supabase
from ..schemas import SubjectIn
from ..errors import db_errors

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("")
def list_subjects(q: str | None = None):
    query = supabase.table("subjects").select("*").order("subject_code")
    if q:
        term = "".join(ch for ch in q if ch not in ",()%*").strip()
        if term:
            query = query.or_(
                f"subject_code.ilike.%{term}%,subject_name.ilike.%{term}%"
            )
    return query.execute().data


@router.get("/{subject_id}")
def get_subject(subject_id: int):
    rows = supabase.table("subjects").select("*").eq("id", subject_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Subject not found")
    return rows[0]


@router.post("", status_code=201)
def create_subject(payload: SubjectIn):
    with db_errors():
        result = supabase.table("subjects").insert(payload.model_dump()).execute()
    return result.data[0]


@router.put("/{subject_id}")
def update_subject(subject_id: int, payload: SubjectIn):
    with db_errors():
        rows = (
            supabase.table("subjects")
            .update(payload.model_dump())
            .eq("id", subject_id)
            .execute()
            .data
        )
    if not rows:
        raise HTTPException(status_code=404, detail="Subject not found")
    return rows[0]


@router.delete("/{subject_id}")
def delete_subject(subject_id: int):
    with db_errors():
        rows = supabase.table("subjects").delete().eq("id", subject_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"deleted": subject_id}