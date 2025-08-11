# collector/base_collector.py
from pymongo import MongoClient, ReplaceOne
from config import MONGO_URI, MONGO_DB
from pymongo.errors import DuplicateKeyError

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client[MONGO_DB]

def ensure_indexes():
    """
    Create unique indexes to prevent duplicates.
    Call this at app startup (e.g., in app.py).
    """
    db = get_db()
    db.github_events.create_index("pr_id", unique=True, sparse=True)
    db.jenkins_deployments.create_index("build_id", unique=True, sparse=True)
    db.prometheus_alerts.create_index("alert_id", unique=True, sparse=True)

def upsert_one(collection_name, filter_doc, doc):
    db = get_db()
    return db[collection_name].update_one(filter_doc, {"$set": doc}, upsert=True)

def upsert_many(collection_name, docs, id_field):
    """
    Bulk upsert by id_field to avoid duplicates.
    id_field: unique key in docs like 'pr_id' or 'build_id' or 'alert_id'
    """
    if not docs:
        return 0
    db = get_db()
    ops = []
    for d in docs:
        key = d.get(id_field)
        if not key:
            continue
        ops.append(ReplaceOne({id_field: key}, d, upsert=True))
    if not ops:
        return 0
    res = db[collection_name].bulk_write(ops, ordered=False)
    return res.upserted_count + res.modified_count
