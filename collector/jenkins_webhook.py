# collector/jenkins_webhook.py
from collector.base_collector import upsert_one
from collector.utils import require_shared_secret
from config import JENKINS_SHARED_SECRET

def handle_jenkins_webhook(headers: dict, payload: dict):
    # Expect a shared secret header e.g., X-Anametric-Token
    token = headers.get("x-anametric-token") or headers.get("x-jenkins-token")
    if not require_shared_secret(token, JENKINS_SHARED_SECRET):
        raise PermissionError("Invalid Jenkins webhook token")

    # Jenkins must be configured to send a payload with these fields
    # This format will vary by Jenkins and your plugin; adapt as necessary.
    build = payload.get("build") or payload
    build_id = build.get("number") or build.get("id")
    status = build.get("status") or build.get("result")
    timestamp_ms = build.get("timestamp")  # Jenkins classic returns ms
    # convert to ISO: if ms -> divide by 1000
    if isinstance(timestamp_ms, (int, float)):
        from datetime import datetime
        timestamp = datetime.utcfromtimestamp(timestamp_ms / 1000).strftime("%Y-%m-%dT%H:%M:%SZ")
    else:
        timestamp = build.get("timestamp") or build.get("date")

    # commit info may be nested in actions/revisions depending on job plugins
    commit_sha = None
    # try common fields
    commit_sha = build.get("commit") or build.get("scm", {}).get("commit") or build.get("actions", {}).get("lastBuiltRevision", {}).get("SHA1")

    doc = {
        "build_id": build_id,
        "job_name": build.get("job_name") or payload.get("job_name"),
        "status": status,
        "timestamp": timestamp,
        "commit_sha": commit_sha
    }
    upsert_one("jenkins_deployments", {"build_id": doc["build_id"]}, doc)
    return {"status": "ok", "build_id": build_id}
