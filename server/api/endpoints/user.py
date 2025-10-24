from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from models.models import User
from ..services.auth import get_current_user

user_router = APIRouter(prefix="/user", tags=["user"])

@user_router.get("/me", status_code=200)
async def get_my_email(current_user: User = Depends(get_current_user)):
    return JSONResponse({"email": current_user.email})
