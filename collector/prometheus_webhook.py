# collector/prometheus_webhook.py
from collector.base_collector import upsert_one
from collector.utils import require_shared_secret
from config import ALERTMANAGER_SHARED_SECRET

def handle_prometheus_webhook(headers: dict, payload: dict):
    token = headers.get("x-anametric-token")
    if not require_shared_secret(token, ALERTMANAGER_SHARED_SECRET):
        raise PermissionError("Invalid Alertmanager webhook token")

    alerts = payload.get("alerts", [])
    results = []
    for a in alerts:
        labels = a.get("labels", {})
        startsAt = a.get("startsAt")
        endsAt = a.get("endsAt")
        # create stable alert_id; Alertmanager can also provide a fingerprint in some setups
        alert_id = labels.get("alertname", "alert") + "_" + labels.get("service", "") + "_" + (startsAt or "")
        doc = {
            "alert_id": alert_id,
            "name": labels.get("alertname"),
            "startsAt": startsAt,
            "endsAt": endsAt,
            "severity": labels.get("severity") or labels.get("level"),
            "description": a.get("annotations", {}).get("description", ""),
            "labels": labels
        }
        upsert_one("prometheus_alerts", {"alert_id": doc["alert_id"]}, doc)
        results.append(doc["alert_id"])
    return {"status": "ok", "processed": results}

