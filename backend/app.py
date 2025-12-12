from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Any
import uvicorn
import os

from data_prep import preprocess_prediction_input, get_feature_importance_map
from utils import (
    load_xgboost_model, load_feature_names, load_prophet_models,
    get_shap_explanations, generate_recommendation, get_forecast_results,
    validate_input_data
)

# Initialize FastAPI app
app = FastAPI(
    title="PrognosAir ML Backend",
    description="Predictive maintenance and environmental forecasting API for aircraft",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for loaded models
xgboost_model = None
feature_names = None
icing_model = None
corrosion_model = None

# Pydantic models for request/response
class PredictionRequest(BaseModel):
    flight_hours: float
    cycles: float
    total_airframe_hours: float
    engine_hours: float
    avg_altitude_ft: float
    sector_length_nm: float
    temperature_c: float
    humidity_pct: float
    precipitation_mm: float
    wind_speed_kts: float
    turbulence_events: float
    icing_reports: float
    visibility_km: float
    sand_dust_index: float
    days_since_last_maintenance: float
    maintenance_actions_last_year: float
    component_age_hours: float
    num_open_MEL_items: float
    recent_minor_defects: float
    bird_strike_reports: float
    runway_incident_report: float
    crew_hours_last_7days: float
    turnaround_time_min: float
    part_data: Dict[str, Any]

class PredictionResponse(BaseModel):
    predicted_class: int
    probabilities: List[float]
    top_features: Dict[int, List[List[Any]]]
    recommendation: Dict[str, Any]

class ForecastResponse(BaseModel):
    icing_forecast: List[Dict[str, Any]]
    corrosion_forecast: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    xgboost_loaded: bool
    prophet_models_loaded: bool

@app.on_event("startup")
async def startup_event():
    """Load models on startup."""
    global xgboost_model, feature_names, icing_model, corrosion_model

    try:
        xgboost_model = load_xgboost_model()
        if xgboost_model is None:
            print("XGBoost model could not be loaded")
        else:
            print("XGBoost model loaded successfully")
        feature_names = load_feature_names()
        icing_model, corrosion_model = load_prophet_models()
        print("All models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")
        print("Models will be loaded on first request or training")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    global xgboost_model, feature_names, icing_model, corrosion_model

    xgboost_loaded = xgboost_model is not None
    prophet_loaded = icing_model is not None and corrosion_model is not None

    return HealthResponse(
        status="healthy" if xgboost_loaded and prophet_loaded else "degraded",
        models_loaded=xgboost_loaded and prophet_loaded,
        xgboost_loaded=xgboost_loaded,
        prophet_models_loaded=prophet_loaded
    )

@app.post("/predict", response_model=PredictionResponse)
async def predict_issue(request: PredictionRequest):
    """Predict aircraft issue type with explanations and recommendations."""
    global xgboost_model, feature_names

    # Load models if not loaded
    if xgboost_model is None:
        try:
            xgboost_model = load_xgboost_model()
            if xgboost_model is None:
                raise HTTPException(status_code=500, detail="XGBoost model could not be loaded")
            feature_names = load_feature_names()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Model loading failed: {str(e)}")

    # Convert request to dict (handle Pydantic V2 compatibility)
    try:
        input_data = request.model_dump()  # Pydantic V2
    except AttributeError:
        input_data = request.dict()  # Pydantic V1

    # Validate input
    is_valid, error_msg = validate_input_data(input_data, feature_names)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    try:
        # Preprocess input
        X_input = preprocess_prediction_input(input_data, feature_names)

        # Make prediction
        probabilities = xgboost_model.predict_proba(X_input)[0]
        predicted_class = int(xgboost_model.predict(X_input)[0])

        # Get SHAP explanations for all classes
        top_features = get_shap_explanations(xgboost_model, X_input, feature_names)

        # Generate recommendation based on the predicted class's features
        recommendation = generate_recommendation(predicted_class, top_features.get(predicted_class, []), input_data, input_data['part_data'])

        return PredictionResponse(
            predicted_class=predicted_class,
            probabilities=[round(float(p), 4) for p in probabilities],
            top_features=top_features,
            recommendation=recommendation
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/forecast", response_model=ForecastResponse)
async def get_forecast():
    """Get 7-day icing and corrosion risk forecasts."""
    global icing_model, corrosion_model

    # Load models if not loaded
    if icing_model is None or corrosion_model is None:
        try:
            icing_model, corrosion_model = load_prophet_models()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Forecast model loading failed: {str(e)}")

    try:
        forecast_data = get_forecast_results(icing_model, corrosion_model, periods=7)
        return ForecastResponse(**forecast_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")

@app.post("/train")
async def retrain_models():
    """Retrain models with updated data."""
    global xgboost_model, feature_names, icing_model, corrosion_model

    try:
        # Import training functions
        from train_multiclass import train_xgboost_model, save_model
        from train_forecast import train_forecast_models, save_prophet_model

        # Retrain XGBoost model
        model, features, accuracy = train_xgboost_model()
        save_model(model, features)

        # Retrain Prophet models
        icing_model, corrosion_model = train_forecast_models()
        save_prophet_model(icing_model, 'models/icing_prophet_model.joblib')
        save_prophet_model(corrosion_model, 'models/corrosion_prophet_model.joblib')

        # Reload models in memory
        xgboost_model = load_xgboost_model()
        feature_names = load_feature_names()

        icing_model, corrosion_model = load_prophet_models()

        return {
            "message": "Models retrained successfully",
            "xgboost_accuracy": round(accuracy, 4)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/features")
async def get_features():
    """Get list of required features."""
    global feature_names

    if feature_names is None:
        try:
            feature_names = load_feature_names()
        except Exception as e:
            # Return default feature list if loading fails
            feature_names = [
                'flight_hours', 'cycles', 'total_airframe_hours', 'engine_hours',
                'avg_altitude_ft', 'sector_length_nm', 'temperature_c', 'humidity_pct',
                'precipitation_mm', 'wind_speed_kts', 'turbulence_events', 'icing_reports',
                'visibility_km', 'sand_dust_index', 'days_since_last_maintenance',
                'maintenance_actions_last_year', 'component_age_hours', 'num_open_MEL_items',
                'recent_minor_defects', 'bird_strike_reports', 'runway_incident_report',
                'crew_hours_last_7days', 'turnaround_time_min'
            ]

    feature_map = get_feature_importance_map()

    return {
        "features": feature_names,
        "descriptions": feature_map
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
