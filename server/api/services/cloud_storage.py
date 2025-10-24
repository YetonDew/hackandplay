from google.cloud import storage
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, HTTPException
from io import BytesIO
import os

client = storage.Client()

bucket_name = os.getenv('BUCKET_NAME')

def get_pdf_from_gcs(file_name: str):
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    
    pdf_content = blob.download_as_bytes()
    
    return pdf_content

def get_pdf(file_name: str):
    try:
        pdf_content = get_pdf_from_gcs(file_name)
        return StreamingResponse(BytesIO(pdf_content), media_type='application/pdf', headers={"Content-Disposition": f"inline; filename={file_name}"})
    
    except Exception as e:
        return {"error": str(e)}
    

def upload_file_to_gcs(file: UploadFile, file_name: str):
    try:
        bucket = client.bucket(bucket_name)
        
        blob = bucket.blob(file_name)
        
        blob.upload_from_file(file.file, content_type=file.content_type)
        return {"message": f"File '{file_name}' uploaded successfully to Google Cloud Storage!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

