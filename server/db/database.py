from sqlmodel import SQLModel, create_engine, Session
from fastapi import Depends
from typing import Annotated
import os
from dotenv import load_dotenv


load_dotenv()

DB_URL = os.getenv('DATABASE_URL')

engine = create_engine(DB_URL)


def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]