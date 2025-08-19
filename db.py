from pymongo import MongoClient

def get_mongo_collections():
    client = MongoClient("mongodb://localhost:27017")  # or Atlas URI
    db = client["metricsDB"]  # Change this to your DB name

    github_events = db["github_events"].find()
    jenkins_logs = db["jenkins_deployments"].find()
    prometheus_alerts = db["prometheus_alerts"].find()

    return list(github_events), list(jenkins_logs), list(prometheus_alerts)
