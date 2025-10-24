from fastapi import FastAPI, Request
from db.database import engine, Session
from api.services.auth import get_current_user
from models.models import SQLModel, Log
from api.endpoints.auth import auth_router
from api.endpoints.files import files_router
from api.endpoints.user import user_router
from api.endpoints.chat import chat_router
from api.endpoints.logs import log_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
origins = [
    "http://localhost:3000",
    "https://projectxrepo-749362345242.europe-west3.run.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(files_router)
app.include_router(user_router)
app.include_router(chat_router)
app.include_router(log_router)


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

        log = Log(
            method=method,
            path=path,
            status_code=status_code,
            ip_address=ip_address,
            user_id=user.id if user else None,
        )

        session.add(log)
        session.commit()

    return response