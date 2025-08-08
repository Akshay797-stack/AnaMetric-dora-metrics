from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor.df_processor import get_deployment_frequency
from processor.lt_processor import get_lead_time 
from processor.mttr_processor import calculate_mttr_from_db
from processor.cfr_processor import calculate_cfr
from db import get_mongo_collections
from datetime import datetime



app = FastAPI(title="Metrics API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend's origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/deployment-frequency")
def deployment_frequency_endpoint(
    start_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS")
):
    result = get_deployment_frequency(start_time, end_time)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/lead-time")
def lead_time_endpoint(
    start_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS")
):
    result = get_lead_time(start_time, end_time)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/mttr")
def mttr_endpoint(
    start_time: str = Query(..., description="YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="YYYY-MM-DD HH:MM:SS")
):
    """
    Returns MTTR metrics (daily/weekly/monthly) for failed deployments
    in the given datetime range.
    """
    result = calculate_mttr_from_db(start_time, end_time)
    return result

@app.get("/api/cfr")
def get_cfr(
    start: str = Query(..., description="Start time in UTC format (YYYY-MM-DD HH:MM:SS)"),
    end: str = Query(..., description="End time in UTC format (YYYY-MM-DD HH:MM:SS)")
):
    try:
        # Convert user input (UTC format) to ISO 8601
        try:
            start_iso = datetime.strptime(start, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
            end_iso = datetime.strptime(end, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            return {"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}

        # Get data from MongoDB
        github_events, jenkins_logs, prometheus_alerts = get_mongo_collections()

        # Calculate CFR
        result = calculate_cfr(start_iso, end_iso, github_events, jenkins_logs, prometheus_alerts)
        return result
    except Exception as e:
        return {"error": str(e)}