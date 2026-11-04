from pathlib import Path
from typing import Literal

import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
MODEL_VERSION = "heuristic-v0"
eta_model = None
delay_model = None

if (MODEL_DIR / "eta_regressor.joblib").exists() and (MODEL_DIR / "delay_classifier.joblib").exists():
    eta_model = joblib.load(MODEL_DIR / "eta_regressor.joblib")
    delay_model = joblib.load(MODEL_DIR / "delay_classifier.joblib")
    MODEL_VERSION = "xgboost-v1"

app = FastAPI(title="Delivery ETA ML Service", version="0.2.0")


class PredictRequest(BaseModel):
    distance_km: float = Field(..., ge=0)
    weight_kg: float = Field(1.0, ge=0)
    area: str
    rider_open_orders: int = Field(0, ge=0)
    payment_type: Literal["COD", "PREPAID"] = "COD"
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    promised_minutes_from_now: int


class PredictResponse(BaseModel):
    eta_low_min: int
    eta_mid_min: int
    eta_high_min: int
    delay_probability: float
    risk_level: Literal["low", "medium", "high"]
    model_version: str


def features(req: PredictRequest) -> np.ndarray:
    # Order must match FEATURES in train.py
    return np.array([[
        req.distance_km,
        req.weight_kg,
        req.rider_open_orders,
        1 if req.payment_type == "COD" else 0,
        req.hour_of_day,
        req.day_of_week,
        req.promised_minutes_from_now,
    ]])


def heuristic(req: PredictRequest):
    """Fallback used until the trained models exist."""
    rush = 1.35 if req.hour_of_day in (8, 9, 17, 18, 19, 20) else 1.0
    load = 1 + 0.05 * req.rider_open_orders
    mid = req.distance_km * 4.0 * rush * load + 10
    prob = min(0.95, max(0.02, (mid - req.promised_minutes_from_now) / max(mid, 1) + 0.3))
    return mid, prob


@app.get("/health")
def health():
    return {"ok": True, "model_version": MODEL_VERSION}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if eta_model is not None and delay_model is not None:
        x = features(req)
        mid = float(eta_model.predict(x)[0])
        prob = float(delay_model.predict_proba(x)[0][1])
    else:
        mid, prob = heuristic(req)

    spread = 0.25 * mid + 5
    risk = "high" if prob >= 0.6 else "medium" if prob >= 0.35 else "low"

    return PredictResponse(
        eta_low_min=max(0, round(mid - spread)),
        eta_mid_min=max(0, round(mid)),
        eta_high_min=max(0, round(mid + spread)),
        delay_probability=round(prob, 3),
        risk_level=risk,
        model_version=MODEL_VERSION,
    )