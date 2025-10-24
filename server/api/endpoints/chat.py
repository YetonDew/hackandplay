from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from db.database import SessionDep
from api.dtos.chat import ChatAnswerDTO
from ..services.auth import get_current_user
from ..services.chat import get_answer
from typing import Dict
import json

chat_router = APIRouter(prefix='/chat', tags=['auth'])

@chat_router.post('/send_conversation', status_code=200)
async def send_conversation(conversation: ChatAnswerDTO, session: SessionDep):
    # conversation = json.loads(conversation)
    conversation = conversation.conversation
    print(type(conversation))
    # get_current_user(session, token)
    chat_answer = await get_answer(conversation)
    return JSONResponse({"response": chat_answer})

