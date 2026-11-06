from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier, XGBRegressor

MODEL_DIR = Path(__file__).resolve().parent / "models"
RNG = np.random.default_rng(42)
N = 5000

AREAS = {
    "Saddar": 1.25, "North Nazimabad": 1.15, "Gulshan-e-Iqbal": 1.20,
    "Korangi": 1.30, "DHA Phase 6": 1.00, "Clifton": 0.95,
    "Nazimabad": 1.10, "Malir": 1.35,
}

FEATURES = [
    "distance_km", "weight_kg", "rider_open_orders",
    "is_cod", "hour_of_day", "day_of_week", "promised_minutes_from_now",
]


def generate(n: int) -> pd.DataFrame:
    """Synthetic orders. Travel time depends on distance, rush hour, rider load, area and rain."""
    area = RNG.choice(list(AREAS), size=n)
    area_factor = np.array([AREAS[a] for a in area])
    distance = RNG.uniform(1, 15, n)
    weight = RNG.uniform(0.2, 5, n)
    rider_load = RNG.integers(1, 11, n)
    cod = RNG.integers(0, 2, n)
    hour = RNG.integers(8, 23, n)
    dow = RNG.integers(0, 7, n)

    rush = np.where(np.isin(hour, [8, 9, 17, 18, 19, 20]), 1.35, 1.0)
    load = 1 + 0.05 * rider_load
    rain = RNG.random(n) < 0.2
    rain_factor = np.where(rain, 1.25, 1.0)

    travel_min = distance * 4.0 * rush * load * area_factor * rain_factor + 10
    travel_min = travel_min * RNG.normal(1.0, 0.12, n)  # real-world noise

    promised_from_now = RNG.integers(20, 180, n)
    delayed = (travel_min > promised_from_now).astype(int)

    return pd.DataFrame({
        "distance_km": distance,
        "weight_kg": weight,
        "rider_open_orders": rider_load,
        "is_cod": cod,
        "hour_of_day": hour,
        "day_of_week": dow,
        "promised_minutes_from_now": promised_from_now,
        "travel_min": travel_min,
        "delayed": delayed,
    })


def main():
    df = generate(N)
    X = df[FEATURES]
    train_X, test_X, train_t, test_t, train_y, test_y = train_test_split(
        X, df["travel_min"], df["delayed"], test_size=0.2, random_state=42
    )

    eta = XGBRegressor(n_estimators=300, max_depth=5, learning_rate=0.05, subsample=0.9)
    eta.fit(train_X, train_t)
    eta_mae = mean_absolute_error(test_t, eta.predict(test_X))

    delay = XGBClassifier(
        n_estimators=300, max_depth=4, learning_rate=0.05, subsample=0.9, eval_metric="logloss"
    )
    delay.fit(train_X, train_y)
    delay_auc = roc_auc_score(test_y, delay.predict_proba(test_X)[:, 1])

    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(eta, MODEL_DIR / "eta_regressor.joblib")
    joblib.dump(delay, MODEL_DIR / "delay_classifier.joblib")

    print(f"ETA model MAE: {eta_mae:.1f} minutes")
    print(f"Delay model ROC-AUC: {delay_auc:.3f}")
    print(f"Saved to {MODEL_DIR}")


if __name__ == "__main__":
    main()