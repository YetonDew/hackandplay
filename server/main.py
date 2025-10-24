from fastapi import FastAPI, Request
from db.database import engine, Session
from api.services.auth import get_current_user
from models.models import SQLModel 
from api.endpoints.auth import auth_router
from api.endpoints.user import user_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)


SQLModel.metadata.create_all(engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.middleware("http")
async def log_request(request: Request, call_next):
    method = request.method
    path = str(request.url.path)
    ip_address = request.client.host

    response = await call_next(request)
    status_code = response.status_code

    with Session(engine) as session:
        user = None
        try:
            user = await get_current_user(request)
        except Exception:
            pass

        

    return response