import requests
import json
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = "AIzaSyC4nKmeoq50d6ghum-gAX5pd0klFAf5E6g"
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def get_dora_ai_insights(dora_metrics_output: dict) -> dict:
    """
    Input: DORA metrics output (dict with deployment_frequency, lead_time, mttr, cfr)
    Output: AI insights including analysis, trend, prediction, suggestion
    """
    try:
        logger.info(f"Processing DORA metrics for AI insights: {dora_metrics_output}")
        
        # Create minimal summary for AI prompt
        summary = {}

        if "deployment_frequency" in dora_metrics_output:
            df = dora_metrics_output["deployment_frequency"]
            if isinstance(df, dict) and "start_date" in df and "end_date" in df:
                try:
                    # Handle both string and datetime objects
                    start_date = df.get("start_date")
                    end_date = df.get("end_date")
                    
                    # Convert to datetime if they're strings
                    if isinstance(start_date, str):
                        start_dt = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
                    else:
                        start_dt = start_date
                        
                    if isinstance(end_date, str):
                        end_dt = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
                    else:
                        end_dt = end_date
                    
                    period_days = (end_dt - start_dt).days
                except (ValueError, TypeError) as e:
                    logger.warning(f"Error parsing dates in deployment_frequency: {e}")
                    period_days = "Unknown"
                
                summary["deployment_frequency"] = {
                    "total_deployments": df.get("count", 0),
                    "period_days": period_days
                }
            else:
                summary["deployment_frequency"] = {
                    "total_deployments": df.get("count", 0) if isinstance(df, dict) else 0,
                    "period_days": "Unknown"
                }

        if "lead_time" in dora_metrics_output:
            lt = dora_metrics_output["lead_time"]
            if isinstance(lt, dict) and lt:
                try:
                    summary["lead_time"] = {
                        "average_hours": round(sum(lt.values()) / len(lt), 2) if lt else 0,
                        "number_of_commits": len(lt)
                    }
                except (TypeError, ValueError) as e:
                    logger.warning(f"Error processing lead_time data: {e}")
                    summary["lead_time"] = {
                        "average_hours": 0,
                        "number_of_commits": 0
                    }
            else:
                summary["lead_time"] = {
                    "average_hours": 0,
                    "number_of_commits": 0
                }

        if "mttr" in dora_metrics_output:
            mttr = dora_metrics_output["mttr"]
            if isinstance(mttr, dict) and mttr:
                try:
                    summary["mttr"] = {
                        "average_minutes": round(sum(mttr.values()) / len(mttr), 2) if mttr else 0,
                        "failures_count": len(mttr)
                    }
                except (TypeError, ValueError) as e:
                    logger.warning(f"Error processing mttr data: {e}")
                    summary["mttr"] = {
                        "average_minutes": 0,
                        "failures_count": 0
                    }
            else:
                summary["mttr"] = {
                    "average_minutes": 0,
                    "failures_count": 0
                }

        if "cfr" in dora_metrics_output:
            cfr = dora_metrics_output["cfr"]
            if isinstance(cfr, dict):
                summary["cfr"] = {
                    "change_failure_rate": cfr.get("Change Failure Rate (%)", 0)
                }
            else:
                summary["cfr"] = {
                    "change_failure_rate": 0
                }

        logger.info(f"Created summary for AI: {summary}")

        prompt = f"""
You are a DevOps AI assistant. Analyze the following DORA metrics and provide insights in plain text format (no markdown symbols like # or *). Use bold text for important terms by wrapping them in **bold**.

Provide:
1. Analysis of the metrics
2. Trend detection (increasing/decreasing)
3. Future prediction for next period
4. Suggestions for improvement

Format your response as plain text paragraphs. Use **bold** for key metrics, trends, and recommendations.

Metrics Summary:
{json.dumps(summary, indent=2)}
"""

        headers = {"Content-Type": "application/json"}
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 500
            }
        }

        logger.info("Sending request to Gemini API")
        response = requests.post(f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}", headers=headers, json=data)
        
        if response.status_code != 200:
            logger.error(f"Gemini API error: {response.status_code} - {response.text}")
            return {"error": f"Failed to get AI insights: {response.text}"}

        result = response.json()
        ai_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No insight returned")

        logger.info("Successfully received AI insights")
        return {"ai_insights": ai_text}
        
    except Exception as e:
        logger.error(f"Unexpected error in get_dora_ai_insights: {e}")
        return {"error": f"Failed to get AI insights: {str(e)}"}
