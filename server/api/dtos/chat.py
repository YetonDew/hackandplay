from pydantic import BaseModel
from typing import List, Dict


class MessageObj(BaseModel):
    role: str
    content: str


class ChatAnswerDTO(BaseModel):
    conversation: List[MessageObj]

