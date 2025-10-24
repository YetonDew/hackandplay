from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum
from datetime import datetime



class Role(str, Enum):
    DEFAULT = 'default'
    SUPER = "super"

class SenderType(str, Enum):
    USER = "user"
    BOT = "bot"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False)
    role: Role

    messages: List["Message"] = Relationship(back_populates="user")
    files: List["File"] = Relationship(back_populates="user")
    logs: List["Log"] = Relationship(back_populates="user")

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str = Field(nullable=False)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.now)
    sender_type: SenderType = Field(default=SenderType.USER)

    user: Optional[User] = Relationship(back_populates="messages")

class File(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str = Field(nullable=False, unique=True)
    user_id: int = Field(foreign_key="user.id")

    user: Optional[User] = Relationship(back_populates="files")

class LogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"

class Log(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.now)
    method: str
    path: str
    status_code: int
    ip_address: str
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")

    user: Optional["User"] = Relationship(back_populates="logs")

