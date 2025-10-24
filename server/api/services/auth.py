from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import datetime, timedelta
from db.database import SessionDep
from models.models import User
from api.dtos.auth import RegisterDTO
from hashlib import sha256
import os
from sqlmodel import select

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_user(email: str, session: SessionDep) -> User:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()

def create_user(user: RegisterDTO, session: SessionDep):
    hashed_password = sha256(user.password.encode()).hexdigest()
    new_user = User(email=user.email,
                    password=hashed_password,
                    role='default')
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

def create_access_token(data: dict, expire_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now() + expire_delta
    to_encode.update({"exp": expire})
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return access_token

def get_current_user(session: SessionDep, token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = get_user(email=email, session=session)
    if user is None:
        raise credentials_exception

    return user
