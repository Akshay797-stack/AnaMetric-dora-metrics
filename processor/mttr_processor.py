import json
import os
from datetime import datetime
from collections import defaultdict

JENKINS_PATH = "../tests/sample_raw_data/jenkins_deployments.json"
PROMETHEUS_PATH = "../tests/sample_raw_data/prometheus_alerts.json"
OUTPUT_DIR = "outputs"

DAILY_FILE = os.path.join(OUTPUT_DIR, "mttr_daily.json")
WEEKLY_FILE = os.path.join(OUTPUT_DIR, "mttr_weekly.json")
MONTHLY_FILE = os.path.join(OUTPUT_DIR, "mttr_monthly.json")
INVALID_LOG = os.path.join(OUTPUT_DIR, "invalid_mttr_log.txt")

def parse_time(ts):
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except:
        return None

def get_period_key(dt, granularity):
    if granularity == "daily":
        return dt.strftime("%Y-%m-%d")
    elif granularity == "weekly":
        return dt.strftime("%Y-W%U")
    elif granularity == "monthly":
        return dt.strftime("%Y-%m")

def log_invalid(reason, data):
    with open(INVALID_LOG, "a") as f:
        f.write(json.dumps({"reason": reason, "data": data}, default=str) + "\n")

def write_output(data, path):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

def process_mttr():
    # Load files
    with open(JENKINS_PATH) as f:
        jenkins_data = json.load(f)

    with open(PROMETHEUS_PATH) as f:
        alerts = json.load(f)

    # Sort alerts by startsAt
    sorted_alerts = sorted(
        [a for a in alerts if a.get("severity", "").lower() in ["critical", "high"]],
        key=lambda x: parse_time(x["startsAt"])
    )

    # Build time buckets
    daily, weekly, monthly = defaultdict(list),defaultdict(list),defaultdict(list)

    for deploy in jenkins_data:
        if deploy.get("status") != "FAILURE":
            continue

        deploy_time = parse_time(deploy.get("timestamp"))
        if not deploy_time:
            log_invalid("Invalid deploy timestamp", deploy)
            continue

        # Find the first alert that starts AFTER this deployment
        matching_alert = next((
            a for a in sorted_alerts
            if parse_time(a["startsAt"]) and parse_time(a["startsAt"]) >= deploy_time
        ), None)

        if not matching_alert:
            log_invalid("No alert found after failed deploy", deploy)
            continue

        recovery_time = parse_time(matching_alert.get("endsAt"))
        if not recovery_time or recovery_time < deploy_time:
            log_invalid("Invalid recovery time", matching_alert)
            continue

        mttr_minutes = (recovery_time - deploy_time).total_seconds() / 60.0

        # Store in time buckets
        for gran, bucket in [("daily", daily), ("weekly", weekly), ("monthly", monthly)]:
            key = get_period_key(deploy_time, gran)
            bucket[key].append(mttr_minutes)

    # Aggregate average MTTR
    daily_avg = {k: round(sum(v)/len(v), 2) for k, v in daily.items()}
    weekly_avg = {k: round(sum(v)/len(v), 2) for k, v in weekly.items()}
    monthly_avg = {k: round(sum(v)/len(v), 2) for k, v in monthly.items()}

    # Save results
    write_output(daily_avg, DAILY_FILE)
    write_output(weekly_avg, WEEKLY_FILE)
    write_output(monthly_avg, MONTHLY_FILE)

    print("MTTR processing completed...")

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    open(INVALID_LOG, "w").close()
    process_mttr()
