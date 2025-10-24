from pydantic import BaseModel

class RegisterDTO(BaseModel):
    email: str
    password: str
    name: str

class LoginDTO(BaseModel):
    email: str
    password: str