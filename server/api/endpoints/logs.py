from fastapi import APIRouter, HTTPException, Depends
from models.models import Log, User, Role
from db.database import SessionDep
from sqlmodel import select
from ..services.auth import get_current_user

log_router = APIRouter(prefix="/log", tags=["log"])

@log_router.get("/get_logs", status_code=200)
async def get_logs(session: SessionDep, current_user: User = Depends(get_current_user)):
    if current_user.role != "SUPER":
        raise HTTPException(status_code=401, detail="Not authorized")
    logs = session.exec(select(Log)).all()
    return logs
