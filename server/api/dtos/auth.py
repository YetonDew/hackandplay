from pydantic import BaseModel

class RegisterDTO(BaseModel):
    email: str
    password: str

class LoginDTO(BaseModel):
    email: str
    password: str