# 🧱 MetricSync Architecture

![MetricSync Architecture](./architecture.png)

## Overview

MetricSync is built with a modular and extensible architecture that automates the collection, processing, and visualization of DORA metrics. The architecture includes:

- **Metric Collector API Layer:** Pulls JSON data from tools like GitHub, Jenkins, and Prometheus using API clients or webhooks.
- **Metric Processor Engine:** Parses and normalizes data into a unified format and computes DORA metrics (DF, LT, MTTR, CFR).
- **MongoDB Time-Series Storage:** Stores raw tool data, normalized events, and computed metrics.
- **Visualization & AI Insights Layer:** Future scope to build dashboards and smart insights.

---

⚠️ This is the initial MVP architecture. We will refine and evolve it as the project progresses.
