from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from api.dtos.auth import RegisterDTO, LoginDTO
from datetime import timedelta
from ..services.auth import get_user, create_user, create_access_token
from db.database import SessionDep
from hashlib import sha256


auth_router = APIRouter(prefix="/auth", tags=["auth"])

@auth_router.post("/register", status_code=201)
async def register_user(user: RegisterDTO,session: SessionDep):
    new_user = get_user(user.email, session)
    if new_user:
        raise HTTPException(status_code=400,
                            detail=f"User '{user.email} already exists")
    create_user(user, session)
    return JSONResponse({"message": "User created successfully"})

@auth_router.post("/login", status_code=200)
async def login(user: LoginDTO, session: SessionDep):
    db_user = get_user(user.email, session)
    if not db_user:
        raise HTTPException(status_code=400, detail='Incorrect email or password')

    hashed_input_password = sha256(user.password.encode()).hexdigest()
    if db_user.password != hashed_input_password:
        raise HTTPException(status_code=400, detail='Incorrect email or password')

    access_token = create_access_token({"sub": user.email}, timedelta(minutes=45))
    return JSONResponse({"access_token": access_token})