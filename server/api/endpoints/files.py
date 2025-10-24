from fastapi import APIRouter, UploadFile, Depends, HTTPException, File as FastAPIFile
from fastapi.responses import JSONResponse
from ..services.cloud_storage import get_pdf, upload_file_to_gcs
from models.models import User, File
from ..services.auth import get_current_user
from db.database import SessionDep
from sqlmodel import select


files_router = APIRouter(prefix="/files", tags=["files"])

@files_router.get("/get_user_files", status_code=200)
async def get_user_files(session: SessionDep, current_user: User = Depends(get_current_user)):
    try:
        user_files = session.exec(select(File).where(File.user_id == current_user.id)).all()
        
        filenames = [file.filename for file in user_files]
        
        return JSONResponse({"filenames": filenames})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve files: {str(e)}")


@files_router.post("/upload", status_code=200)
async def upload_file(
    session: SessionDep,
    file: UploadFile = FastAPIFile(...),
    current_user: User = Depends(get_current_user)):
    try:
        file_name = file.filename
        response = upload_file_to_gcs(file, file_name)
        new_file = File(filename=file_name, user_id=current_user.id)
        session.add(new_file)
        session.commit()
        return JSONResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
