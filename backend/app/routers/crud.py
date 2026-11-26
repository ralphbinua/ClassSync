from fastapi import APIRouter, HTTPException
from ..db import supabase
from ..errors import db_errors


def _clean(q: str) -> str:
    """Remove characters that would break the Supabase search filter."""
    return "".join(ch for ch in q if ch not in ",()%*").strip()


def make_crud_router(
    table: str,
    label: str,
    SchemaIn,
    order_by: str,
    search_cols: list[str],
) -> APIRouter:
    router = APIRouter(prefix=f"/{table}", tags=[table])

    @router.get("")
    def list_items(q: str | None = None):
        query = supabase.table(table).select("*").order(order_by)
        if q and _clean(q):
            term = _clean(q)
            query = query.or_(",".join(f"{c}.ilike.%{term}%" for c in search_cols))
        with db_errors():
            return query.execute().data

    @router.get("/{item_id}")
    def get_item(item_id: int):
        with db_errors():
            rows = supabase.table(table).select("*").eq("id", item_id).execute().data
        if not rows:
            raise HTTPException(status_code=404, detail=f"{label} not found")
        return rows[0]

    @router.post("", status_code=201)
    def create_item(payload: SchemaIn):
        with db_errors():
            return supabase.table(table).insert(payload.model_dump()).execute().data[0]

    @router.put("/{item_id}")
    def update_item(item_id: int, payload: SchemaIn):
        with db_errors():
            rows = (
                supabase.table(table)
                .update(payload.model_dump())
                .eq("id", item_id)
                .execute()
                .data
            )
        if not rows:
            raise HTTPException(status_code=404, detail=f"{label} not found")
        return rows[0]

    @router.delete("/{item_id}")
    def delete_item(item_id: int):
        with db_errors():
            rows = supabase.table(table).delete().eq("id", item_id).execute().data
        if not rows:
            raise HTTPException(status_code=404, detail=f"{label} not found")
        return {"deleted": item_id}

    return router