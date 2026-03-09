from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from analytics.analyzer import AdAnalyzer
from recommendation.engine import RecommendationEngine
import uvicorn
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AdsMaster AI Engine",
    description="AI Analytics and Optimization Engine for Facebook Ads",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = AdAnalyzer()
engine = RecommendationEngine()


class MetricRecord(BaseModel):
    ad_id: str
    impressions: int
    clicks: int
    ctr: float
    cpc: float
    cpa: float
    roas: float
    spend: float
    revenue: float
    conversions: int
    reach: int
    frequency: float
    date: Optional[str] = None


class AnalyzeRequest(BaseModel):
    user_id: str
    metrics: List[MetricRecord]
    campaign_name: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-engine", "version": "1.0.0"}


@app.post("/analyze")
def analyze_ads(request: AnalyzeRequest):
    """Analyze ad metrics and return insights + recommendations."""
    try:
        metrics_data = [m.dict() for m in request.metrics]
        analysis = analyzer.analyze(metrics_data)
        recommendations = engine.generate(analysis)

        return {
            "success": True,
            "user_id": request.user_id,
            "analysis": analysis,
            "recommendations": recommendations,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-performance")
def predict_performance(request: AnalyzeRequest):
    """Predict future ad performance using historical metrics."""
    try:
        from prediction.model import PerformancePredictor
        predictor = PerformancePredictor()
        metrics_data = [m.dict() for m in request.metrics]
        predictions = predictor.predict(metrics_data)
        return {"success": True, "predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
