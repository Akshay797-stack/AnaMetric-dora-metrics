
from pymongo import MongoClient
from datetime import datetime

def get_deployment_frequency(start_time: str, end_time: str):
    try:
        # Convert input strings to datetime objects
        start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return {"error": "Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'"}

    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["metricsDB"]
    collection = db["jenkins_deployments"]

    # MongoDB query (ISO format with 'Z' for UTC)
    query = {
        "job_name": "prod-deploy",
        "status": "SUCCESS",
        "timestamp": {
            "$gte": start_dt.isoformat() + "Z",
            "$lte": end_dt.isoformat() + "Z"
        }
    }

    results = list(collection.find(query, {"_id": 0, "timestamp": 1, "build_id": 1}))

    return {
        "count": len(results),
        "deployments": results
    }

def get_deployment(start_time: str, end_time: str):
    try:
        # Convert input strings to datetime objects
        start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return {"error": "Invalid datetime format. Use 'YYYY-MM-DD HH:MM:SS'"}

    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["metricsDB"]
    collection = db["jenkins_deployments"]

    # MongoDB query (ISO format with 'Z' for UTC)
    query = {
        "job_name": "prod-deploy",
        "status": "SUCCESS",
        "timestamp": {
            "$gte": start_dt.isoformat() + "Z",
            "$lte": end_dt.isoformat() + "Z"
        }
    }

    results = list(collection.find(query, {"_id": 0, "timestamp": 1, "build_id": 1}))

    return {
        "count": len(results),
        "start_date": start_time,
        "end_date": end_time
    }

