from pymongo import MongoClient
from datetime import datetime
from collections import defaultdict

def parse_time(ts):
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None

def get_period_key(dt, granularity):
    if granularity == "daily":
        return dt.strftime("%Y-%m-%d")
    elif granularity == "weekly":
        return dt.strftime("%Y-W%U")
    elif granularity == "monthly":
        return dt.strftime("%Y-%m")

def calculate_mttr_from_db(start_time_str, end_time_str):
    # Convert input strings to datetime
    try:
        start_time = datetime.strptime(start_time_str, "%Y-%m-%d %H:%M:%S")
        end_time = datetime.strptime(end_time_str, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return {"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}

    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["metricsDB"]
    deployments = db["jenkins_deployments"]
    alerts = db["prometheus_alerts"]

    # Filter data in date range
    failed_deploys = list(deployments.find({
        "status": "FAILURE",
        "timestamp": {
            "$gte": start_time.isoformat() + "Z",
            "$lte": end_time.isoformat() + "Z"
        }
    }))

    relevant_alerts = list(alerts.find({
        "severity": {"$in": ["critical", "high"]},
        "startsAt": {
            "$gte": start_time.isoformat() + "Z",
            "$lte": end_time.isoformat() + "Z"
        }
    }))

    sorted_alerts = sorted(relevant_alerts, key=lambda x: parse_time(x["startsAt"]))
    daily, weekly, monthly = defaultdict(list), defaultdict(list), defaultdict(list)

    for deploy in failed_deploys:
        deploy_time = parse_time(deploy.get("timestamp"))
        if not deploy_time:
            continue

        # Find alert that occurred after deployment
        matching_alert = next((
            a for a in sorted_alerts
            if parse_time(a["startsAt"]) and parse_time(a["startsAt"]) >= deploy_time
        ), None)

        if not matching_alert:
            continue

        recovery_time = parse_time(matching_alert.get("endsAt"))
        if not recovery_time or recovery_time < deploy_time:
            continue

        mttr_minutes = (recovery_time - deploy_time).total_seconds() / 60.0

        for granularity, bucket in [("daily", daily), ("weekly", weekly), ("monthly", monthly)]:
            key = get_period_key(deploy_time, granularity)
            bucket[key].append(mttr_minutes)

    # Compute averages
    result = {
        "daily": {k: round(sum(v)/len(v), 2) for k, v in daily.items()},
    }

    return result
