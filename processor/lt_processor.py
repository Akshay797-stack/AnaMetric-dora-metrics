from datetime import datetime
from pymongo import MongoClient
from collections import defaultdict

client = MongoClient("mongodb://localhost:27017")
db = client["metricsDB"]
github_col = db["github_events"]
jenkins_col = db["jenkins_deployments"]

def parse_timestamp(ts):
    # Handles both common GitHub/Jenkins ISO formats (with or without 'Z')
    if not ts:
        return None
    try:
        if ts.endswith("Z"):
            return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
        else:
            return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S")
    except Exception:
        return None

def get_period_key(date_obj, granularity):
    if granularity == "daily":
        return date_obj.strftime("%Y-%m-%d")
    elif granularity == "weekly":
        return f"{date_obj.strftime('%Y')}-W{date_obj.strftime('%U')}"
    elif granularity == "monthly":
        return date_obj.strftime("%Y-%m")
    else:
        return "unknown"

def calculate_lead_time(start, end):
    return (end - start).total_seconds() / 3600  # in hours

def get_lead_time(start_time: str, end_time: str):
    # Parse user input
    try:
        start_dt = datetime.strptime(start_time, "%Y-%m-%d %H:%M:%S")
        end_dt = datetime.strptime(end_time, "%Y-%m-%d %H:%M:%S")
    except Exception:
        return {"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS"}

    # Load all potentially relevant deployments (successful only)
    deployment_cursor = jenkins_col.find(
        {
            "status": "SUCCESS",
            "timestamp": {
                "$gte": start_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "$lte": end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
        },
        {"commit_sha": 1, "timestamp": 1, "_id": 0}
    )
    valid_deployments = {
        doc["commit_sha"]: doc
        for doc in deployment_cursor if doc.get("commit_sha") and doc.get("timestamp")
    }

    # Load GitHub commit docs whose any commit's timestamp in window
    # (filtering at application level)
    github_docs = github_col.find({}, {"commits": 1, "_id": 0})

    daily_data = defaultdict(list)
    weekly_data = defaultdict(list)
    monthly_data = defaultdict(list)

    for pr_doc in github_docs:
        for commit in pr_doc.get("commits", []):
            sha = commit.get("sha")
            commit_time = parse_timestamp(commit.get("timestamp"))

            if not sha or not commit_time:
                continue
            if not (start_dt <= commit_time <= end_dt):
                continue

            deploy_info = valid_deployments.get(sha)
            if not deploy_info:
                continue

            deploy_time = parse_timestamp(deploy_info["timestamp"])
            if not deploy_time or deploy_time < commit_time:
                continue

            lt_hours = calculate_lead_time(commit_time, deploy_time)
            for granularity, target in (
                ("daily", daily_data),
                ("weekly", weekly_data),
                ("monthly", monthly_data),
            ):
                key = get_period_key(deploy_time, granularity)
                target[key].append(lt_hours)

    # Average calculation
    def avg(data_dict):
        return {k: round(sum(v) / len(v), 2) for k, v in data_dict.items() if v}

    out = {
        "daily": avg(daily_data),
    }
    return out

    