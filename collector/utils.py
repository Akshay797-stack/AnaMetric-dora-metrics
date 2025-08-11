# collector/utils.py
import hmac
import hashlib
import json
from datetime import datetime

def verify_github_signature(secret: str, signature_header: str, body: bytes) -> bool:
    """
    Verify X-Hub-Signature-256 header.
    signature_header: 'sha256=...'
    """
    if not secret or not signature_header:
        return False
    sha_name, signature = signature_header.split('=')
    mac = hmac.new(secret.encode(), msg=body, digestmod=hashlib.sha256)
    expected = mac.hexdigest()
    return hmac.compare_digest(expected, signature)

def require_shared_secret(received: str, expected: str) -> bool:
    if not expected:
        # If no secret configured, treat as false in prod — safer to require a secret.
        return False
    return hmac.compare_digest(received, expected)

def parse_iso(ts: str):
    """Try to parse ISO 8601 naive UTC timestamps returned by tools."""
    if not ts:
        return None
    # Basic parse; you can extend to use dateutil.parser
    try:
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        try:
            return datetime.fromisoformat(ts)
        except Exception:
            return None

def normalize_commit_sha(sha: str) -> str:
    return sha.strip() if sha else None
