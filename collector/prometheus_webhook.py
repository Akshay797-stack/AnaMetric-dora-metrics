# collector/prometheus_webhook.py
from collector.base_collector import upsert_one
from collector.utils import require_shared_secret
from config import ALERTMANAGER_SHARED_SECRET
from bson import ObjectId  # Only for demonstration (Mongo will auto-generate if omitted)

def handle_prometheus_webhook(headers: dict, payload: dict):
    """
    Handles Alertmanager webhook payload and stores alerts in MongoDB.
    Matches the required Anametric Prometheus JSON schema.
    """
    token = headers.get("x-anametric-token")
    if not require_shared_secret(token, ALERTMANAGER_SHARED_SECRET):
        raise PermissionError("Invalid Alertmanager webhook token")

    alerts = payload.get("alerts", [])
    results = []

    for a in alerts:
        labels = a.get("labels", {})
        startsAt = a.get("startsAt")
        endsAt = a.get("endsAt")

        # If Alertmanager doesn't give an explicit alert_id, create one
        # Format: alert_<increment> (or you can use fingerprint from AM)
        alert_id = labels.get("alert_id") or f"alert_{hash((labels.get('alertname', ''), labels.get('service', ''), startsAt)) & 0xffffffff}"

        # Construct doc in required format
        doc = {
            "alert_id": alert_id,
            "name": labels.get("alertname"),
            "startsAt": startsAt,
            "endsAt": endsAt,
            "severity": labels.get("severity"),
            "description": a.get("annotations", {}).get("description", ""),
            "labels": {
                "alertname": labels.get("alertname"),
                "severity": labels.get("severity"),
                "service": labels.get("service"),
                "commit": labels.get("commit")
            }
        }

        # Upsert by alert_id to avoid duplicates
        upsert_one("prometheus_alerts", {"alert_id": doc["alert_id"]}, doc)
        results.append(doc["alert_id"])

    return {"status": "ok", "processed_alerts": results}
