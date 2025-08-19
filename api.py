from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from processor.df_processor import get_deployment
from processor.df_processor import get_deployment_frequency
from processor.lt_processor import get_lead_time 
from processor.mttr_processor import calculate_mttr_from_db
from processor.cfr_processor import calculate_cfr
from db import get_mongo_collections
from datetime import datetime
from processor.ai_insights_processor import get_dora_ai_insights
from processor.forecast import forecast_metric




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
    
def stringify_data(obj):
    """Recursively convert all non-string values to strings."""
    if isinstance(obj, dict):
        return {k: stringify_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [stringify_data(v) for v in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    else:
        return str(obj)

def get_all_dora_metrics_internal(start_time: str, end_time: str):
    """
    Internal function to get all DORA metrics for AI insights processing.
    """
    try:
        # --- Step 0: Prepare ISO format for CFR ---
        try:
            start_iso = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
            end_iso = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            return {"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}

        # --- Step 1: Load data from MongoDB ---
        github_events, jenkins_logs, prometheus_alerts = get_mongo_collections()

        # --- Step 2: Collect all DORA metrics ---
        deployment_freq = get_deployment(start_time, end_time)
        lead_time = get_lead_time(start_time, end_time)
        mttr = calculate_mttr_from_db(start_time, end_time)
        cfr = calculate_cfr(start_iso, end_iso, github_events, jenkins_logs, prometheus_alerts)

        dora_metrics = {
            "deployment_frequency": deployment_freq,
            "lead_time": lead_time,
            "mttr": mttr,
            "cfr": cfr
        }

        return {
            "dora_metrics": dora_metrics
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/dora-metrics")
def get_all_dora_metrics(
    start_time: str = Query(..., description="YYYY-MM-DD HH:MM:SS UTC"),
    end_time: str = Query(..., description="YYYY-MM-DD HH:MM:SS UTC")
):
    try:
        # --- Step 0: Prepare ISO format for CFR ---
        try:
            start_iso = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
            end_iso = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            return {"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}

        # --- Step 1: Load data from MongoDB ---
        github_events, jenkins_logs, prometheus_alerts = get_mongo_collections()

        # --- Step 2: Collect all DORA metrics ---
        deployment_freq = get_deployment(start_time, end_time)
        lead_time = get_lead_time(start_time, end_time)
        mttr = calculate_mttr_from_db(start_time, end_time)
        cfr = calculate_cfr(start_iso, end_iso, github_events, jenkins_logs, prometheus_alerts)

        dora_metrics = {
            "deployment_frequency": deployment_freq,
            "lead_time": lead_time,
            "mttr": mttr,
            "cfr": cfr
        }

        # --- Step 3: Get AI Insights (pass original data types) ---
        try:
            ai_insights = get_dora_ai_insights(dora_metrics)
        except Exception as e:
            ai_insights = {"error": f"Failed to get AI insights: {str(e)}"}

        return {
            "dora_metrics": dora_metrics,  # keep original types for API
            "ai_insights": ai_insights
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/ai-insights")
def ai_insights_endpoint(
    start_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="Format: YYYY-MM-DD HH:MM:SS")
):
    """
    Get AI insights for DORA metrics in the given time range.
    """
    try:
        # Get all DORA metrics first
        dora_metrics = get_all_dora_metrics_internal(start_time, end_time)
        
        if "error" in dora_metrics:
            raise HTTPException(status_code=400, detail=dora_metrics["error"])
        
        # Extract just the DORA metrics for AI processing
        metrics_data = dora_metrics.get("dora_metrics", {})
        
        # Get AI insights
        ai_insights = get_dora_ai_insights(metrics_data)
        
        return {
            "ai_insights": ai_insights,
            "metrics_summary": {
                "deployment_frequency": metrics_data.get("deployment_frequency", {}),
                "lead_time": metrics_data.get("lead_time", {}),
                "mttr": metrics_data.get("mttr", {}),
                "cfr": metrics_data.get("cfr", {})
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI insights failed: {str(e)}")

@app.get("/forecast")
def forecast_endpoint(
    metric: str = Query(..., description="Metric to forecast: deployment_frequency, lead_time, mttr, cfr"),
    start_time: str = Query(..., description="UTC: YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="UTC: YYYY-MM-DD HH:MM:SS"),
    days: int = Query(30, ge=1, le=365, description="Days to forecast"),
):
    """
    Forecast a DORA metric using Prophet.
    metric: deployment_frequency | lead_time | mttr | cfr
    """
    try:
        # validate inputs early
        datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format. Use YYYY-MM-DD HH:MM:SS")

    try:
        result = forecast_metric(metric, start_time, end_time, days)
        return {
            "metric": metric,
            "days": days,
            "result": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")

@app.get("/forecast/{metric}")
def forecast_endpoint_path(
    metric: str,
    start_time: str = Query(..., description="UTC: YYYY-MM-DD HH:MM:SS"),
    end_time: str = Query(..., description="UTC: YYYY-MM-DD HH:MM:SS"),
    periods: int = Query(30, ge=1, le=365, description="Days to forecast"),
):
    """
    Forecast a DORA metric using Prophet (path parameter version).
    metric: deployment_frequency | lead_time | mttr | cfr
    """
    try:
        # validate inputs early
        datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format. Use YYYY-MM-DD HH:MM:SS")

    try:
        result = forecast_metric(metric, start_time, end_time, periods)
        return {
            "metric": metric,
            "periods": periods,
            "result": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")