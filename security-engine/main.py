from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os

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
    Ejecuta un escaneo de seguridad simulado.
    En el futuro, esto llamará a los scripts reales de ZAP/TruffleHog.
    """
    if not request.target_url:
        raise HTTPException(status_code=400, detail="Target URL is required")

    # Simulación de ejecución de tarea
    print(f"Iniciando escaneo {request.scan_type} para {request.target_url}")

    return {
        "status": "success",
        "job_id": "mock-job-123",
        "target": request.target_url,
        "results": {
            "vulnerabilities": [
                {"severity": "High", "name": "SQL Injection", "description": "Posible inyección SQL detectada en /login"},
                {"severity": "Medium", "name": "Missing Headers", "description": "Falta X-Content-Type-Options"}
            ],
            "score": "C"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
