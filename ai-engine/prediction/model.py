import numpy as np
import pandas as pd
from typing import List, Dict, Any


class PerformancePredictor:
    """Simple rule-based + trend analysis predictor for ad performance."""

    def predict(self, metrics: List[Dict[str, Any]], days_ahead: int = 7) -> Dict[str, Any]:
        if not metrics:
            return {"error": "No data to predict from"}

        df = pd.DataFrame(metrics)
        numeric_cols = ["impressions", "clicks", "ctr", "cpc", "spend", "revenue", "conversions"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        # Compute trends (simple linear regression slope)
        trends = {}
        for col in ["ctr", "cpa", "roas", "spend"]:
            if col in df.columns and len(df) >= 2:
                x = np.arange(len(df))
                y = df[col].values
                if np.std(y) > 0:
                    slope = np.polyfit(x, y, 1)[0]
                    trends[col] = {
                        "current": round(float(y[-1]), 3),
                        "slope": round(float(slope), 4),
                        "trend": "increasing" if slope > 0.01 else ("decreasing" if slope < -0.01 else "stable"),
                        "predicted_7d": round(float(y[-1] + slope * days_ahead), 3),
                    }

        # Predict budget consumption
        avg_spend = float(df["spend"].mean()) if "spend" in df else 0
        predicted_spend = avg_spend * days_ahead

        # Performance forecast
        current_roas = float(df["roas"].mean()) if "roas" in df else 0
        forecast = {
            "predicted_spend": round(predicted_spend, 2),
            "predicted_revenue": round(predicted_spend * current_roas, 2),
            "confidence": "medium" if len(df) >= 7 else "low",
            "data_points": len(df),
        }

        return {
            "trends": trends,
            "forecast": forecast,
            "recommendation": self._generate_forecast_recommendation(trends, current_roas),
        }

    def _generate_forecast_recommendation(self, trends: dict, current_roas: float) -> str:
        if current_roas < 1:
            return "⚠️ Current ROAS below 1x. Pause campaign and review strategy before spending more."
        elif current_roas >= 4:
            return "✅ Strong ROAS. Consider scaling budget by 20-30% to maximize returns."
        
        ctr_trend = trends.get("ctr", {}).get("trend", "stable")
        if ctr_trend == "decreasing":
            return "📉 CTR is declining — creative fatigue likely. Refresh creatives in next 3-5 days."
        
        return "📊 Performance is stable. Monitor daily and test 1-2 new creatives this week."
