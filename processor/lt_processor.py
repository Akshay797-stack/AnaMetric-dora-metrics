import json
from datetime import datetime
from typing import List, Dict


def calculate_lead_time(github_path: str, jenkins_path: str) -> List[Dict]:
    """
    Calculate lead time for changes using GitHub PR commit timestamps and Jenkins deployment times.

    Args:
        github_path (str): Path to GitHub events JSON.
        jenkins_path (str): Path to Jenkins deployment JSON.

    Returns:
        List[Dict]: List of commits with lead time in minutes and timestamps.
    """

    # Step 1: Load GitHub PR data
    with open(github_path, 'r') as f:
        github_data = json.load(f)

    # Step 2: Map each commit SHA to its earliest timestamp
    commit_to_time = {}
    for pr in github_data:
        if not pr.get("commits"):
            continue
        # Find the first commit (by timestamp) in the PR
        first_commit = min(pr["commits"], key=lambda c: c["timestamp"])
        sha = first_commit["sha"]
        timestamp = first_commit["timestamp"].replace("Z", "")
        commit_to_time[sha] = datetime.fromisoformat(timestamp)

    # Step 3: Load Jenkins deployment data
    with open(jenkins_path, 'r') as f:
        jenkins_data = json.load(f)

    # Step 4: Match commit to deployment and calculate lead time
    lead_times = []
    for deploy in jenkins_data:
        if deploy.get("status") != "SUCCESS":
            continue

        sha = deploy.get("commit_sha")
        if sha in commit_to_time:
            deploy_time = datetime.fromisoformat(deploy["timestamp"].replace("Z", ""))
            commit_time = commit_to_time[sha]
            lead_time = (deploy_time - commit_time).total_seconds() / 60

            lead_times.append({
                "commit_sha": sha,
                "lead_time_minutes": round(lead_time, 2),
                "commit_time": commit_time.isoformat(),
                "deploy_time": deploy_time.isoformat()
            })

    return lead_times

if __name__ == "__main__":
    github_path = "tests/sample_raw_data/github_events.json"
    jenkins_path = "tests/sample_raw_data/jenkins_deployments.json"

    lt_data = calculate_lead_time(github_path, jenkins_path)

    for item in lt_data:
        print(item)
