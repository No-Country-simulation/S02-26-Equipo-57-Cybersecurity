from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import os
import uuid
from scanner_lib import run_full_scan

app = FastAPI()

class ScanRequest(BaseModel):
    target_url: str
    scan_type: str = "quick"

@app.get("/")
def read_root():
    return {"status": "SASK Security Engine Running", "version": "1.0.0"}

@app.post("/scan")
def run_scan(request: ScanRequest):
    """
    Ejecuta un escaneo de seguridad real usando scanner_lib.
    """
    if not request.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")

    job_id = str(uuid.uuid4())
    print(f"Iniciando escaneo {request.scan_type} para {request.target_url} (Job ID: {job_id})")

    try:
        # Ejecutar escaneo real
        result = run_full_scan(request.target_url, job_id)
        
        # Adaptar respuesta para el frontend
        return {
            "status": "success",
            "job_id": job_id,
            "target": request.target_url,
            "results": {
                "vulnerabilities": [
                    {"severity": f["severity"], "name": f["type"], "description": f["description"]}
                    for f in result["findings"]
                ],
                "score": "C" if len(result["findings"]) > 0 else "A",
                "csv_report": f"/reports/{os.path.basename(result['csv_report'])}"
            }
        }
    except Exception as e:
        print(f"Error durante el escaneo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reports/{filename}")
def get_report(filename: str):
    file_path = os.path.join("reports", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='text/csv', filename=filename)
    raise HTTPException(status_code=404, detail="Report not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
