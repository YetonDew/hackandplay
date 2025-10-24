from fastapi import Depends
from models.models import User, File
from ..services.auth import get_current_user
from db.database import SessionDep
from sqlmodel import select


async def get_user_files(session: SessionDep, current_user: User = Depends(get_current_user)):
    user_files = session.exec(select(File).where(File.user_id == current_user.id)).all()
    filenames = [file.filename for file in user_files]
    return filenames
