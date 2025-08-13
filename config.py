# config.py
from dotenv import load_dotenv
import os

load_dotenv()  # loads .env in repo root or environment

# Mongo
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "metricsDB")

# Webhook secrets
GITHUB_WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")
JENKINS_SHARED_SECRET = os.getenv("JENKINS_SHARED_SECRET")
ALERTMANAGER_SHARED_SECRET = os.getenv("ALERTMANAGER_SHARED_SECRET")

# App
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("APP_PORT", 8000))
