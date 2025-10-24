from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from pgvector.sqlalchemy import Vector
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True, nullable=False)
    password: str = Field(nullable=False)
    name: str = Field()


class Items(SQLModel, table=True):
    id: int = Field(primary_key=True)
    content: str = Field()
    embedding: list[float] = Field(sa_column=Column(Vector(384)))


