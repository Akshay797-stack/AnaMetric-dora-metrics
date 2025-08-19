# processor/forecast.py

from datetime import datetime
from typing import Tuple, List, Dict
from pymongo import MongoClient
import pandas as pd
from prophet import Prophet

# --- Mongo connection ---
client = MongoClient("mongodb://localhost:27017")
db = client["metricsDB"]
jenkins_col = db["jenkins_deployments"]
alerts_col = db["prometheus_alerts"]  # optional for CFR enhancement
github_col = db["github_events"]      # used by LT computation elsewhere if needed

# --- helpers ---
def _parse_iso(ts: str):
    if not ts:
        return None
    try:
        if ts.endswith("Z"):
            return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%SZ")
        return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S")
    except Exception:
        return None

def _to_iso_utc(dt_str: str) -> str:
    # input: "YYYY-MM-DD HH:MM:SS" (UTC naive); output ISO "YYYY-MM-DDTHH:MM:SSZ"
    return datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S").strftime("%Y-%m-%dT%H:%M:%SZ")

def _empty_df():
    return pd.DataFrame(columns=["ds", "y"])

def _preprocess_data_for_forecasting(df: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess data to improve forecasting accuracy.
    """
    if df.empty:
        return df
    
    # Ensure we have enough data points for meaningful forecasting
    if len(df) < 7:  # Need at least a week of data
        return df
    
    # Remove outliers using IQR method for more stable forecasts
    Q1 = df['y'].quantile(0.25)
    Q3 = df['y'].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    
    # Cap outliers instead of removing them to preserve data continuity
    df['y'] = df['y'].clip(lower=lower_bound, upper=upper_bound)
    
    # Ensure no negative values for metrics that shouldn't be negative
    df['y'] = df['y'].clip(lower=0)
    
    # Fill any remaining NaN values with forward fill then backward fill
    df['y'] = df['y'].fillna(method='ffill').fillna(method='bfill')
    
    return df

def _fit_prophet(df: pd.DataFrame, periods: int, freq: str = "D") -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fit Prophet on (ds, y) and forecast future periods.
    Returns (history_df, forecast_df yhat/yhat_lower/yhat_upper).
    """
    if df.empty:
        return df, pd.DataFrame(columns=["ds", "yhat", "yhat_lower", "yhat_upper"])

    # Adapt seasonalities to the span of available data to reduce overfitting
    try:
        span_days = int((pd.to_datetime(df["ds"]).max() - pd.to_datetime(df["ds"]).min()).days) or 0
    except Exception:
        span_days = 0

    daily_flag = span_days >= 3
    weekly_flag = span_days >= 14
    yearly_flag = span_days >= 365

    m = Prophet(
        interval_width=0.95,
        daily_seasonality=daily_flag,
        weekly_seasonality=weekly_flag,
        yearly_seasonality=yearly_flag,
        seasonality_mode='multiplicative',
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        holidays_prior_scale=10.0,
        changepoint_range=0.8,
    )

    # Custom monthly seasonality tends to help without overfitting too much
    m.add_seasonality(name='monthly', period=30.5, fourier_order=5)

    # Fit the model
    m.fit(df)

    # Create future dataframe
    future = m.make_future_dataframe(periods=periods, freq=freq, include_history=True)

    # Make prediction with uncertainty
    fcst = m.predict(future)

    # Enforce non-negative forecasts for inherently non-negative metrics
    for col in ["yhat", "yhat_lower", "yhat_upper"]:
        if col in fcst.columns:
            fcst[col] = fcst[col].clip(lower=0.0)

    return (
        df,
        fcst[["ds", "yhat", "yhat_lower", "yhat_upper"]],
    )

def _series_to_json(hist: pd.DataFrame, fcst: pd.DataFrame) -> Dict[str, List[Dict]]:
    history = [{"ds": r["ds"].strftime("%Y-%m-%d"), "y": float(r["y"])} for _, r in hist.iterrows()]
    forecast = [
        {
            "ds": r["ds"].strftime("%Y-%m-%d"),
            "yhat": float(r["yhat"]),
            "yhat_lower": float(r["yhat_lower"]),
            "yhat_upper": float(r["yhat_upper"]),
        }
        for _, r in fcst.iterrows()
    ]
    return {"history": history, "forecast": forecast}

# --- 1) Deployment Frequency time series (daily count of SUCCESS prod-deploy) ---
def deployment_frequency_series(start_time: str, end_time: str) -> pd.DataFrame:
    start_iso = _to_iso_utc(start_time)
    end_iso = _to_iso_utc(end_time)

    cur = jenkins_col.find(
        {
            "job_name": "prod-deploy",
            "status": "SUCCESS",
            "timestamp": {"$gte": start_iso, "$lte": end_iso},
        },
        {"timestamp": 1, "_id": 0},
    )

    dates = [_parse_iso(d["timestamp"]) for d in cur if _parse_iso(d.get("timestamp"))]
    if not dates:
        return _empty_df()

    s = pd.Series(1, index=pd.to_datetime(dates))
    # daily counts across the full range (fill missing days with 0)
    daily = s.resample("D").sum().asfreq("D", fill_value=0)
    df = daily.reset_index()
    df.columns = ["ds", "y"]
    return df

# --- 2) Lead Time time series (daily average hours) ---
# If you already have get_lead_time(start,end) -> {"daily": {...}} use that; else compute here.
from processor.lt_processor import get_lead_time  # assumes your existing function returns {"daily": {...}}

def lead_time_series(start_time: str, end_time: str) -> pd.DataFrame:
    lt = get_lead_time(start_time, end_time)
    # Expecting {"daily": {"YYYY-MM-DD": hours, ...}} based on your earlier output
    daily = lt.get("daily", {}) if isinstance(lt, dict) else {}
    if not daily:
        return _empty_df()
    df = pd.DataFrame(
        {"ds": pd.to_datetime(list(daily.keys())), "y": list(daily.values())}
    ).sort_values("ds")
    # Fill any missing days between min and max with NaN, then forward/back fill or 0
    full_idx = pd.date_range(df["ds"].min(), df["ds"].max(), freq="D")
    df = df.set_index("ds").reindex(full_idx).rename_axis("ds").reset_index()
    df["y"] = df["y"].astype(float).fillna(method="ffill").fillna(method="bfill").fillna(0.0)
    return df

# --- 3) MTTR time series (daily average minutes) ---
from processor.mttr_processor import calculate_mttr_from_db  # expects {"daily": {...}}

def mttr_series(start_time: str, end_time: str) -> pd.DataFrame:
    mttr = calculate_mttr_from_db(start_time, end_time)
    daily = mttr.get("daily", {}) if isinstance(mttr, dict) else {}
    if not daily:
        return _empty_df()
    df = pd.DataFrame(
        {"ds": pd.to_datetime(list(daily.keys())), "y": list(daily.values())}
    ).sort_values("ds")
    full_idx = pd.date_range(df["ds"].min(), df["ds"].max(), freq="D")
    df = df.set_index("ds").reindex(full_idx).rename_axis("ds").reset_index()
    df["y"] = df["y"].astype(float).fillna(method="ffill").fillna(method="bfill").fillna(0.0)
    return df

# --- 4) CFR time series (daily % failed changes) ---
def cfr_series(start_time: str, end_time: str) -> pd.DataFrame:
    """
    Daily CFR = (failed deployments / total deployments) * 100
    Uses Jenkins logs (prod-deploy). If you want to incorporate Prometheus 'critical' alerts,
    you can enhance this by marking commits with alerts as failures.
    """
    start_iso = _to_iso_utc(start_time)
    end_iso = _to_iso_utc(end_time)

    cur = jenkins_col.find(
        {
            "job_name": "prod-deploy",
            "timestamp": {"$gte": start_iso, "$lte": end_iso},
        },
        {"timestamp": 1, "status": 1, "_id": 0},
    )

    rows = [(_parse_iso(d["timestamp"]), d.get("status", "")) for d in cur if _parse_iso(d.get("timestamp"))]
    if not rows:
        return _empty_df()

    df = pd.DataFrame(rows, columns=["ts", "status"])
    df["date"] = df["ts"].dt.floor("D")
    grp = df.groupby("date")["status"].value_counts().unstack(fill_value=0)

    grp["total"] = grp.sum(axis=1)
    grp["failed"] = grp.get("FAILURE", 0)
    grp["cfr"] = (grp["failed"] / grp["total"].clip(lower=1)) * 100.0

    # ensure continuous daily index
    full_idx = pd.date_range(grp.index.min(), grp.index.max(), freq="D")
    series = grp.reindex(full_idx).fillna(0.0)["cfr"]
    out = series.reset_index()
    out.columns = ["ds", "y"]
    return out

# --- public orchestrator ---
def build_series(metric: str, start_time: str, end_time: str) -> pd.DataFrame:
    m = metric.lower()
    if m in ["deployment_frequency", "deployment-frequency", "df"]:
        return deployment_frequency_series(start_time, end_time)
    if m in ["lead_time", "lead-time", "lt"]:
        return lead_time_series(start_time, end_time)
    if m in ["mttr"]:
        return mttr_series(start_time, end_time)
    if m in ["cfr"]:
        return cfr_series(start_time, end_time)
    raise ValueError("Unknown metric. Use one of: deployment_frequency, lead_time, mttr, cfr")

def forecast_metric(metric: str, start_time: str, end_time: str, periods: int = 30) -> Dict[str, List[Dict]]:
    series = build_series(metric, start_time, end_time)
    
    # Preprocess data for better forecasting
    series = _preprocess_data_for_forecasting(series)
    
    # Forecast logic with graceful degradation for small datasets
    n = len(series)

    # If we have at least 3 points, attempt Prophet; otherwise, fall back to naive
    if n >= 3:
        hist, fcst = _fit_prophet(series, periods=periods, freq="D")
        return _series_to_json(hist, fcst)
    else:
        # Naive forecast: extend the last observed value
        history = [{"ds": r["ds"].strftime("%Y-%m-%d"), "y": float(r["y"])} for _, r in series.iterrows()]
        if n == 0:
            return {"history": [], "forecast": []}

        last_ds = pd.to_datetime(series["ds"].iloc[-1])
        last_y = float(series["y"].iloc[-1])
        future_dates = pd.date_range(last_ds + pd.Timedelta(days=1), periods=periods, freq="D")
        forecast = [
            {
                "ds": d.strftime("%Y-%m-%d"),
                "yhat": max(0.0, last_y),
                "yhat_lower": max(0.0, last_y),
                "yhat_upper": max(0.0, last_y),
            }
            for d in future_dates
        ]
        return {"history": history, "forecast": forecast}
