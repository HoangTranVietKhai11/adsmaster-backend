from typing import List, Dict, Any


RECOMMENDATION_TEMPLATES = {
    "LOW_CTR": {
        "INFO": {
            "title": "Improve Your Click-Through Rate",
            "actions": [
                "Test a new headline with a stronger value proposition",
                "Use eye-catching visuals (bright colors, faces, or motion)",
                "Add social proof to your ad copy (reviews, numbers)",
                "Try video format instead of static image",
            ],
        },
        "WARNING": {
            "title": "CTR Below Industry Average — Action Required",
            "actions": [
                "Pause underperforming ads and reallocate budget",
                "Run A/B test with 3-5 creative variations",
                "Narrow audience targeting for better relevance",
                "Refresh ad copy with urgency-driven language",
            ],
        },
        "CRITICAL": {
            "title": "🚨 Critical: CTR Critically Low",
            "actions": [
                "Immediately pause this ad",
                "Audit your ad creative — replace with proven formats",
                "Revisit targeting — audience may be too broad or irrelevant",
                "Check ad placement and consider excluding low-quality placements",
            ],
        },
    },
    "HIGH_CPA": {
        "WARNING": {
            "title": "Cost Per Acquisition Is Too High",
            "actions": [
                "Optimize your landing page conversion rate",
                "Review your checkout/funnel for friction points",
                "Test different CTA buttons and page layouts",
                "Refine audience to higher-intent segments",
            ],
        },
        "CRITICAL": {
            "title": "🚨 Critical: CPA Is Unsustainable",
            "actions": [
                "Pause or reduce budget immediately",
                "Switch to manual bidding with lower caps",
                "Require landing page CRO audit",
                "Test retargeting warm audiences instead of cold traffic",
            ],
        },
    },
    "LOW_ROAS": {
        "CRITICAL": {
            "title": "🚨 ROAS Below Break-Even — Stop Spending",
            "actions": [
                "Pause the campaign immediately to stop losses",
                "Review product pricing vs. ad costs",
                "Focus budget on highest converting ad sets only",
                "Implement proper conversion tracking if not done",
            ],
        },
    },
    "CREATIVE_FATIGUE": {
        "WARNING": {
            "title": "Audience Fatigue Detected",
            "actions": [
                "Introduce 2-3 new creative variations this week",
                "Expand your target audience to reduce frequency",
                "Schedule creative rotation on a weekly basis",
                "Try different ad formats (carousel, video, collection)",
            ],
        },
        "CRITICAL": {
            "title": "🚨 Severe Creative Fatigue — Rotate Now",
            "actions": [
                "Immediately swap all creatives",
                "Create a lookalike audience from recent converters",
                "Expand geographic targeting",
                "Reset campaign with fresh creative and new audience seeds",
            ],
        },
    },
    "HIGH_CPC": {
        "WARNING": {
            "title": "High Cost Per Click",
            "actions": [
                "Improve ad relevance score by matching copy to audience interests",
                "Test broader audiences to reduce competition",
                "Try automatic placements to find cheaper inventory",
                "Use engagement objective first to build social proof",
            ],
        },
    },
}


class RecommendationEngine:
    """Generates actionable recommendations from analysis results."""

    def generate(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        recommendations = []
        seen_types = set()

        for issue in analysis.get("issues", []):
            issue_type = issue.get("type")
            severity = issue.get("severity", "INFO")
            ad_id = None

            # Find which ad this applies to
            for ad_analysis in analysis.get("per_ad_analysis", []):
                if issue in ad_analysis.get("issues", []):
                    ad_id = ad_analysis.get("ad_id")
                    break

            key = f"{issue_type}_{severity}"
            template = RECOMMENDATION_TEMPLATES.get(issue_type, {}).get(severity)
            if not template:
                template = RECOMMENDATION_TEMPLATES.get(issue_type, {}).get("WARNING", {})

            if not template:
                continue

            dedup_key = f"{issue_type}_{ad_id}"
            if dedup_key in seen_types:
                continue
            seen_types.add(dedup_key)

            recommendations.append({
                "ad_id": ad_id,
                "type": issue_type,
                "severity": severity,
                "title": template["title"],
                "description": issue.get("message", ""),
                "metric_value": issue.get("value"),
                "benchmark": issue.get("benchmark"),
                "actions": template.get("actions", []),
            })

        # Sort by severity: CRITICAL first
        severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
        recommendations.sort(key=lambda r: severity_order.get(r["severity"], 3))

        # Add positive recommendations if all looks good
        if not recommendations:
            summary = analysis.get("summary", {})
            recommendations.append({
                "ad_id": None,
                "type": "PERFORMING_WELL",
                "severity": "INFO",
                "title": "✅ Your Ads Are Performing Well!",
                "description": f"All metrics are within or above industry benchmarks. ROAS: {summary.get('avg_roas', 0)}x, CTR: {summary.get('avg_ctr', 0)}%",
                "actions": [
                    "Scale budget by 20% on top performing ad sets",
                    "Create lookalike audiences from recent converters",
                    "Test new markets or demographics",
                    "Document what works and replicate the formula",
                ],
            })

        return recommendations
