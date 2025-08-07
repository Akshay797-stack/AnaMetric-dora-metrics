import json
from datetime import datetime
from pathlib import Path

# --- Helper: Safe ISO parser ---
def safe_parse_iso(ts):
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        return None

# --- Load Data ---
def load_data():
    current_dir = Path(__file__).parent
    sample_data_folder_path = (current_dir.parent / "tests" / "sample_raw_data").resolve()


    with open(sample_data_folder_path / "github_events.json") as f:
        github_events = json.load(f)

    with open(sample_data_folder_path / "jenkins_deployments.json") as f:
        jenkins_logs = json.load(f)

    with open(sample_data_folder_path / "prometheus_alerts.json") as f:
        prometheus_alerts = json.load(f)

    return github_events, jenkins_logs, prometheus_alerts

# --- Main CFR Calculation ---
def calculate_cfr(start_time_str, end_time_str, github_events, jenkins_logs, prometheus_alerts):
    start_time = safe_parse_iso(start_time_str)
    end_time = safe_parse_iso(end_time_str)

    if not start_time or not end_time:
        raise ValueError("Invalid date format. Use ISO 8601: YYYY-MM-DDTHH:MM:SSZ")

    # Step 1: Merged commits (regardless of time), map sha -> merge time
    merged_commits = {
        commit["sha"]: safe_parse_iso(pr["merged_at"])
        for pr in github_events if "merged_at" in pr
        for commit in pr["commits"]
    }

    # Step 2: Jenkins deployments WITHIN TIME RANGE and for merged commits
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

    # Step 3: Prometheus alerts WITHIN TIME RANGE and CRITICAL
    failed_commits_from_alerts = {
        alert["labels"]["commit"]
        for alert in prometheus_alerts
        if (
            ("commit" in alert.get("labels", {})) and
            (alert.get("severity", "").lower() == "critical" or alert["labels"].get("severity", "").lower() == "critical")
            and (alert_time := safe_parse_iso(alert["startsAt"]))
            and start_time <= alert_time <= end_time
        )
    }

    # Step 4: Count failed commits ONLY ONCE
    failed_commits = {
        d["commit_sha"]
        for d in relevant_deployments
        if d["status"] == "FAILURE" or d["commit_sha"] in failed_commits_from_alerts
    }

    total_changes = len({d["commit_sha"] for d in relevant_deployments})
    failed_changes = len(failed_commits)
    cfr = (failed_changes / total_changes * 100) if total_changes > 0 else 0.0

    # Step 5: Debug output
    print("\n🔍 DEBUG INFO")
    print(f"→ Merged commits found: {len(merged_commits)}")
    print(f"→ Relevant deployments in range: {len(relevant_deployments)}")
    print(f"→ Failed commits (from alerts + jenkins): {failed_changes}")

    return {
        "Start Time": start_time_str,
        "End Time": end_time_str,
        "Total Changes": total_changes,
        "Failed Changes": failed_changes,
        "Change Failure Rate (%)": round(cfr, 2)
    }

# --- Main Entry Point ---
if __name__ == "__main__":
    print("📅 Enter start and end time in ISO format (e.g., 2025-05-01T00:00:00Z)")
    start_time_str = input("Enter start time: ").strip()
    end_time_str = input("Enter end time: ").strip()

    # Adjust path if needed
   
    try:
        github_events, jenkins_logs, prometheus_alerts = load_data()
        result = calculate_cfr(start_time_str, end_time_str, github_events, jenkins_logs, prometheus_alerts)

        print("\n📊 Final CFR Report:")
        for k, v in result.items():
            print(f"{k}: {v}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
