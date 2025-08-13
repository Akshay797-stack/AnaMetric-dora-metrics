# app.py
from fastapi import FastAPI, Request, Header, HTTPException
from collector.github_webhook import handle_github_webhook
from collector.jenkins_webhook import handle_jenkins_webhook
from collector.prometheus_webhook import handle_prometheus_webhook
from collector.base_collector import ensure_indexes

app = FastAPI(title="Anametric Collector API")

@app.on_event("startup")
def startup():
    ensure_indexes()

@app.post("/webhook/github")
async def github_webhook(request: Request, x_hub_signature_256: str = Header(None)):
    body = await request.body()
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(400, "invalid json payload")
    headers = {"x-hub-signature-256": x_hub_signature_256}
    try:
        res = handle_github_webhook(headers, body, payload)
        return res
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except Exception as e:
        raise HTTPException(500, f"internal error: {e}")

@app.post("/webhook/jenkins")
async def jenkins_webhook(request: Request):
    headers = dict(request.headers)
    payload = await request.json()
    try:
        res = handle_jenkins_webhook(headers, payload)
        return res
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/webhook/prometheus")
async def prometheus_webhook(request: Request):
    headers = dict(request.headers)
    payload = await request.json()
    try:
        res = handle_prometheus_webhook(headers, payload)
        return res
    except PermissionError as e:
        raise HTTPException(403, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))
