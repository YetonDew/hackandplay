from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
from models.models import User, Message, SenderType
from ..services.auth import get_current_user
from ..services.chatbot import generate_response
from ..services.files import get_user_files
from db.database import SessionDep
from sqlmodel import select

chat_router = APIRouter(prefix="/chat", tags=["chat"])

@chat_router.post("/send_message", status_code=200)
async def send_message(session: SessionDep, message: str = Body(..., embed=True), current_user: User = Depends(get_current_user)):
    try:

        pdf_names = get_user_files(session, current_user)
            
        response = await generate_response(["1_PDF_chapter_1.pdf"], message)
        # response = await generate_response(pdf_names, message)
        
        return JSONResponse({"response": response})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
    
@chat_router.get("/fetch_chat", status_code=200)
async def fetch_chat(session: SessionDep, current_user: User = Depends(get_current_user)):
    try:
        messages = session.exec(
            select(Message)
            .where(Message.user_id == current_user.id)
            .order_by(Message.created_at)
        ).all()

        message_list = [{"text": message.text, "created_at": message.created_at.isoformat()} for message in messages]

        return JSONResponse(content={"message_list": message_list})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch messages: {str(e)}")
    
