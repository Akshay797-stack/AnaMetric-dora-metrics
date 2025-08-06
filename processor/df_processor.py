import json
from collections import defaultdict
from datetime import datetime

def calculate_deployment_frequency(filepath: str):
    with open(filepath, 'r') as f:
        deployments = json.load(f)

    # Dictionary to count successful deploys per day
    frequency_per_day = defaultdict(int)

    for deploy in deployments:
        if deploy["job_name"] == "prod-deploy" and deploy["status"] == "SUCCESS":
            timestamp = deploy["timestamp"]
            dt = datetime.fromisoformat(timestamp.replace("Z", ""))
            date_str = dt.date().isoformat()
            frequency_per_day[date_str] += 1

    return dict(sorted(frequency_per_day.items()))
