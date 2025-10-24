from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from db.database import SessionDep
from ..services.auth import get_current_user
from typing import Dict

chat_router = APIRouter(prefix='/chat', tags=['auth'])

@chat_router.post('/send_conversation', status_code=200)
async def send_conversation(conversation: Dict, session: SessionDep):
    # get_current_user(session, token)
    pass


