# collector/github_webhook.py
from collector.base_collector import upsert_one, upsert_many
from collector.utils import verify_github_signature
from config import GITHUB_WEBHOOK_SECRET
import requests

def handle_github_webhook(request_headers: dict, request_body: bytes, payload: dict):
    # Validate signature
    sig = request_headers.get("x-hub-signature-256")
    if not verify_github_signature(GITHUB_WEBHOOK_SECRET, sig, request_body):
        raise PermissionError("Invalid GitHub signature")

    # Only act on merged PRs
    action = payload.get("action")
    pr = payload.get("pull_request") or {}
    if action == "closed" and pr.get("merged"):
        commits_url = pr.get("commits_url")
        # Optional: If repo is private, use PAT; else unauth is fine for public
        headers = {}
        # If you want to fetch commits via GitHub API, you can use a token from env (not shown here)
        commits = []
        try:
            r = requests.get(commits_url, headers=headers, timeout=10)
            r.raise_for_status()
            commits_data = r.json()
            commits = [
                {"sha": c["sha"], "timestamp": c["commit"]["committer"]["date"]}
                for c in commits_data
            ]
        except Exception:
            # fall back to using 'commits' in payload if available (some events include commits)
            commits = pr.get("commits", [])

        doc = {
            "pr_id": pr.get("number"),
            "title": pr.get("title"),
            "author": pr.get("user", {}).get("login"),
            "created_at": pr.get("created_at"),
            "merged_at": pr.get("merged_at"),
            "commits": commits,
            "target_branch": pr.get("base", {}).get("ref"),
        }

        # upsert by pr_id to prevent duplicates
        upsert_one("github_events", {"pr_id": doc["pr_id"]}, doc)
        return {"status": "ok", "pr_id": doc["pr_id"]}
    return {"status": "ignored"}
