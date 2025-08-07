import json
import os
from collections import defaultdict
from datetime import datetime

GITHUB_PATH = "../tests/sample_raw_data/github_events.json"
JENKINS_PATH = "../tests/sample_raw_data/jenkins_deployments.json"
OUTPUT_DIR = "outputs"

DAILY_FILE = os.path.join(OUTPUT_DIR, "lt_daily.json")
WEEKLY_FILE = os.path.join(OUTPUT_DIR, "lt_weekly.json")
MONTHLY_FILE = os.path.join(OUTPUT_DIR, "lt_monthly.json")
INVALID_LOG = os.path.join(OUTPUT_DIR, "invalid_lt_log.txt")

def parse_timestamp(ts):
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None

def get_period_key(date_obj, granularity):
    if granularity == "daily":
        return date_obj.strftime("%Y-%m-%d")
    elif granularity == "weekly":
        return date_obj.strftime("%Y-W%U")
    elif granularity == "monthly":
        return date_obj.strftime("%Y-%m")

def calculate_lead_time(start, end):
    return (end - start).total_seconds() / 3600  # in hours

def log_invalid(reason, commit_sha):
    with open(INVALID_LOG, "a") as f:
        f.write(json.dumps({"reason": reason, "commit_sha": commit_sha}) + "\n")

def write_output(data, path):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

def process_lead_time():
    # Load raw data (JSON Format)
    with open(GITHUB_PATH) as gh_file:
        github_data = json.load(gh_file)

    with open(JENKINS_PATH) as jenkins_file:
        jenkins_data = json.load(jenkins_file)

    # Filter successful Jenkins builds only
    valid_deployments = {
        item["commit_sha"]: item
        for item in jenkins_data
        if item["status"] == "SUCCESS"
    }

    # Storage for lead times
    daily_data = defaultdict(list)
    weekly_data = defaultdict(list)
    monthly_data = defaultdict(list)

    for pr in github_data:
        for commit in pr.get("commits", []):
            sha = commit.get("sha")
            commit_time = parse_timestamp(commit.get("timestamp"))

            if not sha or not commit_time:
                log_invalid("Missing or invalid commit timestamp", sha or "UNKNOWN")
                continue

            deploy_info = valid_deployments.get(sha)
            if not deploy_info:
                log_invalid("No successful Jenkins build for this commit", sha)
                continue

            deploy_time = parse_timestamp(deploy_info["timestamp"])
            if not deploy_time:
                log_invalid("Invalid Jenkins timestamp", sha)
                continue

            if deploy_time < commit_time:
                log_invalid("Deployment before commit", sha)
                continue

            lt_hours = calculate_lead_time(commit_time, deploy_time)

            # Group into all buckets
            for granularity, target in zip(
                ["daily", "weekly", "monthly"],
                [daily_data, weekly_data, monthly_data]
            ):
                key = get_period_key(deploy_time, granularity)
                target[key].append(lt_hours)

    # Average the lead times
    daily_avg = {k: round(sum(v)/len(v), 2) for k, v in daily_data.items()}
    weekly_avg = {k: round(sum(v)/len(v), 2) for k, v in weekly_data.items()}
    monthly_avg = {k: round(sum(v)/len(v), 2) for k, v in monthly_data.items()}

    # Save outputs
    write_output(daily_avg, DAILY_FILE)
    write_output(weekly_avg, WEEKLY_FILE)
    write_output(monthly_avg, MONTHLY_FILE)

    print("Lead Time calculation completed...")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    open(INVALID_LOG, "w").close()  # Clear log
    process_lead_time()
