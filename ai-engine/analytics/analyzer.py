import pandas as pd
import numpy as np
from typing import List, Dict, Any

# Industry benchmarks for Facebook Ads
BENCHMARKS = {
    "ctr": {"low": 0.5, "avg": 1.5, "high": 3.0},    # %
    "cpc": {"low": 0.5, "avg": 1.5, "high": 5.0},     # USD
    "cpa": {"low": 5, "avg": 25, "high": 100},          # USD
    "roas": {"low": 1.5, "avg": 3.0, "high": 6.0},     # x
    "frequency": {"warning": 3.5, "critical": 5.0},
}


class AdAnalyzer:
    """Analyzes Facebook ad metrics using Pandas and rule-based logic."""

    def analyze(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not metrics:
            return {"error": "No metrics provided", "issues": [], "summary": {}}

        df = pd.DataFrame(metrics)

        # Ensure numeric types
        numeric_cols = ["impressions", "clicks", "ctr", "cpc", "cpa", "roas", "spend", "revenue", "conversions", "frequency"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

        issues = []
        per_ad = []

        for _, row in df.iterrows():
            ad_issues = self._analyze_single_ad(row)
            per_ad.append({
                "ad_id": row.get("ad_id", "unknown"),
                "issues": ad_issues,
                "score": self._compute_score(row),
            })
            issues.extend(ad_issues)

        summary = self._compute_summary(df)

        return {
            "summary": summary,
            "per_ad_analysis": per_ad,
            "issues": issues,
            "total_ads_analyzed": len(df),
            "ads_with_issues": len([a for a in per_ad if a["issues"]]),
        }

    def _analyze_single_ad(self, row: pd.Series) -> List[Dict]:
        issues = []

        # Low CTR check
        ctr = float(row.get("ctr", 0))
        if ctr < BENCHMARKS["ctr"]["low"]:
            issues.append({
                "type": "LOW_CTR",
                "severity": "CRITICAL",
                "metric": "ctr",
                "value": round(ctr, 2),
                "benchmark": BENCHMARKS["ctr"]["avg"],
                "message": f"CTR {ctr:.2f}% is critically below industry average {BENCHMARKS['ctr']['avg']}%. Test new creatives immediately.",
            })
        elif ctr < BENCHMARKS["ctr"]["avg"]:
            issues.append({
                "type": "LOW_CTR",
                "severity": "WARNING",
                "metric": "ctr",
                "value": round(ctr, 2),
                "benchmark": BENCHMARKS["ctr"]["avg"],
                "message": f"CTR {ctr:.2f}% is below average. Consider refreshing ad creative or copy.",
            })

        # High CPA check
        cpa = float(row.get("cpa", 0))
        if cpa > BENCHMARKS["cpa"]["high"]:
            issues.append({
                "type": "HIGH_CPA",
                "severity": "CRITICAL",
                "metric": "cpa",
                "value": round(cpa, 2),
                "benchmark": BENCHMARKS["cpa"]["avg"],
                "message": f"CPA ${cpa:.2f} is too high. Review targeting and funnel conversion.",
            })
        elif cpa > BENCHMARKS["cpa"]["avg"]:
            issues.append({
                "type": "HIGH_CPA",
                "severity": "WARNING",
                "metric": "cpa",
                "value": round(cpa, 2),
                "benchmark": BENCHMARKS["cpa"]["avg"],
                "message": f"CPA ${cpa:.2f} is above average. Optimize landing page and targeting.",
            })

        # ROAS check
        roas = float(row.get("roas", 0))
        if roas > 0 and roas < BENCHMARKS["roas"]["low"]:
            issues.append({
                "type": "LOW_ROAS",
                "severity": "CRITICAL",
                "metric": "roas",
                "value": round(roas, 2),
                "benchmark": BENCHMARKS["roas"]["avg"],
                "message": f"ROAS {roas:.2f}x means you're losing money. Pause this ad and review strategy.",
            })

        # Creative fatigue (high frequency)
        frequency = float(row.get("frequency", 0))
        if frequency >= BENCHMARKS["frequency"]["critical"]:
            issues.append({
                "type": "CREATIVE_FATIGUE",
                "severity": "CRITICAL",
                "metric": "frequency",
                "value": round(frequency, 2),
                "benchmark": BENCHMARKS["frequency"]["warning"],
                "message": f"Frequency {frequency:.1f} indicates severe creative fatigue. Rotate creatives immediately.",
            })
        elif frequency >= BENCHMARKS["frequency"]["warning"]:
            issues.append({
                "type": "CREATIVE_FATIGUE",
                "severity": "WARNING",
                "metric": "frequency",
                "value": round(frequency, 2),
                "benchmark": BENCHMARKS["frequency"]["warning"],
                "message": f"Frequency {frequency:.1f} suggests audience fatigue. Introduce new creatives.",
            })

        # High CPC
        cpc = float(row.get("cpc", 0))
        if cpc > BENCHMARKS["cpc"]["high"]:
            issues.append({
                "type": "HIGH_CPC",
                "severity": "WARNING",
                "metric": "cpc",
                "value": round(cpc, 2),
                "benchmark": BENCHMARKS["cpc"]["avg"],
                "message": f"CPC ${cpc:.2f} is high. Improve relevance score or expand audience.",
            })

        return issues

    def _compute_score(self, row: pd.Series) -> float:
        """Compute a performance score 0-100."""
        score = 100.0

        ctr = float(row.get("ctr", 0))
        if ctr < BENCHMARKS["ctr"]["low"]: score -= 30
        elif ctr < BENCHMARKS["ctr"]["avg"]: score -= 15

        roas = float(row.get("roas", 0))
        if roas > 0 and roas < BENCHMARKS["roas"]["low"]: score -= 35
        elif roas > 0 and roas < BENCHMARKS["roas"]["avg"]: score -= 15
        elif roas >= BENCHMARKS["roas"]["high"]: score += 10

        frequency = float(row.get("frequency", 0))
        if frequency >= BENCHMARKS["frequency"]["critical"]: score -= 20
        elif frequency >= BENCHMARKS["frequency"]["warning"]: score -= 10

        return max(0.0, min(100.0, score))

    def _compute_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        return {
            "avg_ctr": round(float(df["ctr"].mean()), 2) if "ctr" in df else 0,
            "avg_cpc": round(float(df["cpc"].mean()), 2) if "cpc" in df else 0,
            "avg_cpa": round(float(df["cpa"].mean()), 2) if "cpa" in df else 0,
            "avg_roas": round(float(df["roas"].mean()), 2) if "roas" in df else 0,
            "avg_frequency": round(float(df["frequency"].mean()), 2) if "frequency" in df else 0,
            "total_spend": round(float(df["spend"].sum()), 2) if "spend" in df else 0,
            "total_revenue": round(float(df["revenue"].sum()), 2) if "revenue" in df else 0,
            "total_impressions": int(df["impressions"].sum()) if "impressions" in df else 0,
            "total_clicks": int(df["clicks"].sum()) if "clicks" in df else 0,
            "total_conversions": int(df["conversions"].sum()) if "conversions" in df else 0,
        }
