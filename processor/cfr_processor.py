
from datetime import datetime

def safe_parse_iso(ts):
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None

def calculate_cfr(start_time_str, end_time_str, github_events, jenkins_logs, prometheus_alerts):
    start_time = safe_parse_iso(start_time_str)
    end_time = safe_parse_iso(end_time_str)

    if not start_time or not end_time:
        raise ValueError("Invalid ISO 8601 format.")

    merged_commits = {
        commit["sha"]: safe_parse_iso(pr["merged_at"])
        for pr in github_events if "merged_at" in pr
        for commit in pr.get("commits", [])
    }

    relevant_deployments = [
        {
            "commit_sha": log["commit_sha"],
            "timestamp": safe_parse_iso(log["timestamp"]),
            "status": log["status"]
        }
        for log in jenkins_logs
        if log["commit_sha"] in merged_commits
        and (ts := safe_parse_iso(log["timestamp"]))
        and start_time <= ts <= end_time
    ]

    failed_commits_from_alerts = {
        alert["labels"]["commit"]
        for alert in prometheus_alerts
        if (
            "commit" in alert.get("labels", {}) and
            (alert.get("severity", "").lower() == "critical" or
             alert["labels"].get("severity", "").lower() == "critical")
            and (alert_time := safe_parse_iso(alert["startsAt"]))
            and start_time <= alert_time <= end_time
        )
    }

    failed_commits = {
        d["commit_sha"]
        for d in relevant_deployments
        if d["status"] == "FAILURE" or d["commit_sha"] in failed_commits_from_alerts
    }

    total_changes = len({d["commit_sha"] for d in relevant_deployments})
    failed_changes = len(failed_commits)
    cfr = (failed_changes / total_changes * 100) if total_changes > 0 else 0.0

    return {
        "Start Time": start_time_str,
        "End Time": end_time_str,
        "Total Changes": total_changes,
        "Failed Changes": failed_changes,
        "Change Failure Rate (%)": round(cfr, 2)
    }
