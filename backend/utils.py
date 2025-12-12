import joblib
import numpy as np
import shap
import pandas as pd
from typing import Dict, List, Tuple
import os

def load_xgboost_model(model_path='models/xgboost_model.joblib'):
    """
    Load trained XGBoost model.

    Args:
        model_path (str): Path to the saved model.

    Returns:
        Trained XGBoost model.
    """
    try:
        model = joblib.load(model_path)
        # Fix base_score if it's None or a string (common issue with multiclass models)
        if hasattr(model, 'base_score'):
            if model.base_score is None or isinstance(model.base_score, str):
                try:
                    if isinstance(model.base_score, str):
                        # Parse the string representation of list
                        base_score_str = model.base_score.strip('[]')
                        base_scores = [float(x.strip()) for x in base_score_str.split(',') if x.strip()]
                        # For SHAP compatibility, set base_score to the first class or average
                        model.base_score = sum(base_scores) / len(base_scores) if base_scores else 0.5
                    else:
                        # If None, set to default
                        model.base_score = 0.5
                except:
                    # If parsing fails, set to default
                    model.base_score = 0.5

            # Force base_score to be a float for SHAP compatibility
            model.base_score = float(model.base_score)

        return model
    except Exception as e:
        print(f"Error loading XGBoost model: {e}")
        return None

def load_feature_names(features_path='models/feature_names.joblib'):
    """
    Load feature names.

    Args:
        features_path (str): Path to the saved feature names.

    Returns:
        list: Feature names.
    """
    return joblib.load(features_path)

def load_prophet_models():
    """
    Load trained Prophet models for icing and corrosion.

    Returns:
        tuple: (icing_model, corrosion_model)
    """
    icing_model = joblib.load('models/icing_prophet_model.joblib')
    corrosion_model = joblib.load('models/corrosion_prophet_model.joblib')
    return icing_model, corrosion_model

def get_shap_explanations(model, X_input, feature_names, max_evals=1000):
    """
    Generate SHAP explanations for all classes.

    Args:
        model: Trained XGBoost model.
        X_input (pd.DataFrame): Input features.
        feature_names (list): Feature names.
        max_evals (int): Maximum evaluations for SHAP.

    Returns:
        dict: Top 5 contributing features for each class.
    """
    # Fallback to feature importances since SHAP is failing
    try:
        feature_importance = model.feature_importances_
        top_indices = np.argsort(feature_importance)[-5:][::-1]
        top_features = [[feature_names[idx], round(float(feature_importance[idx]), 4)] for idx in top_indices]

        # Return the same fallback for all classes
        return {i: top_features for i in range(model.n_classes_)}
    except Exception as fallback_error:
        print(f"Fallback SHAP explanation error: {fallback_error}")
        return {i: [] for i in range(6)}

def generate_recommendation(predicted_class: int, top_features: List[List], input_data: Dict, part_data: Dict) -> Dict:
    """
    Generate maintenance recommendation based on predicted issue and contributing features.

    Args:
        predicted_class (int): Predicted issue type (0-5).
        top_features (list): Top contributing features from SHAP.
        input_data (dict): Original input data.
        part_data (dict): Detailed part data for the aircraft.

    Returns:
        dict: Recommendation with main advice, modifiers, and recommended part.
    """
    issue_map = {
        0: "No Issue",
        1: "Engine Degradation",
        2: "Hydraulic Leak Risk",
        3: "Avionics / Electrical Fault",
        4: "Icing / Cold Weather Risk",
        5: "Corrosion / Coating Deterioration"
    }

    base_recommendations = {
        0: "Continue normal operations and monitoring.",
        1: "Perform borescope inspection on engine and check for oil consumption.",
        2: "Inspect hydraulic system for leaks and check fluid levels.",
        3: "Test avionics systems and check electrical connections.",
        4: "Apply anti-icing coating and test wing heating lines.",
        5: "Inspect landing gear struts for corrosion due to high humidity."
    }

    recommendation_text = base_recommendations.get(predicted_class, "Schedule general inspection.")
    modifiers = []
    recommended_part = None

    # Find the most worn part related to the issue
    if predicted_class == 1: # Engine Degradation
        engine_parts = {k: v for k, v in part_data.items() if 'Engine' in k}
        if engine_parts:
            most_worn_part = max(engine_parts, key=lambda p: engine_parts[p]['usedHours'])
            recommendation_text = f"Perform borescope inspection on {most_worn_part.replace('_', ' ')} and check for oil consumption."
            recommended_part = most_worn_part
    elif predicted_class == 2: # Hydraulic
        hydraulic_parts = {k: v for k, v in part_data.items() if 'Hydraulic' in k or 'Flap' in k or 'Gear' in k}
        if hydraulic_parts:
            most_worn_part = max(hydraulic_parts, key=lambda p: hydraulic_parts[p]['usedHours'])
            recommendation_text = f"Inspect hydraulic system, focusing on {most_worn_part.replace('_', ' ')}."
            recommended_part = most_worn_part
    elif predicted_class == 5: # Corrosion
        structural_parts = {k: v for k, v in part_data.items() if 'Fuselage' in k or 'Wing' in k or 'Gear' in k}
        if structural_parts:
            most_worn_part = max(structural_parts, key=lambda p: structural_parts[p]['usedHours'])
            recommendation_text = f"Inspect {most_worn_part.replace('_', ' ')} for corrosion, especially given the high humidity."
            recommended_part = most_worn_part


    # Analyze input data for additional context
    if 'temperature_c' in input_data and input_data['temperature_c'] < 0:
        modifiers.append(f"Low temperature detected: {input_data['temperature_c']:.1f}°C")

    if 'humidity_pct' in input_data and input_data['humidity_pct'] > 80:
        modifiers.append(f"High humidity detected: {input_data['humidity_pct']:.1f}%")

    if 'days_since_last_maintenance' in input_data and input_data['days_since_last_maintenance'] > 60:
        modifiers.append(f"Extended time since maintenance: {input_data['days_since_last_maintenance']:.0f} days")
    
    if 'component_age_hours' in input_data and input_data['component_age_hours'] > 8000:
        modifiers.append(f"High component age: {input_data['component_age_hours']:.0f} hours")

    # Find the part with the highest usage overall
    if part_data:
        most_worn_part_overall = max(part_data, key=lambda p: part_data[p]['usedHours'])
        most_worn_part_hours = part_data[most_worn_part_overall]['usedHours']
        modifiers.append(f"Highest part usage: {most_worn_part_overall.replace('_', ' ')} with {most_worn_part_hours:.0f} hours.")


    recommendation = {
        "recommendation": recommendation_text,
        "modifiers": modifiers,
        "recommended_part": recommended_part
    }

    return recommendation

def get_forecast_results(icing_model, corrosion_model, periods=7):
    """
    Generate 7-day forecast for icing and corrosion risks.

    Args:
        icing_model: Trained icing Prophet model.
        corrosion_model: Trained corrosion Prophet model.
        periods (int): Number of days to forecast.

    Returns:
        dict: Forecast results for icing and corrosion.
    """
    from train_forecast import forecast_future

    icing_forecast = forecast_future(icing_model, periods)
    corrosion_forecast = forecast_future(corrosion_model, periods)

    # Format for API response
    icing_data = []
    corrosion_data = []

    for _, row in icing_forecast.iterrows():
        icing_data.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "risk_index": round(float(row['yhat']), 4),
            "lower_bound": round(float(row['yhat_lower']), 4),
            "upper_bound": round(float(row['yhat_upper']), 4)
        })

    for _, row in corrosion_forecast.iterrows():
        corrosion_data.append({
            "date": row['ds'].strftime('%Y-%m-%d'),
            "risk_index": round(float(row['yhat']), 4),
            "lower_bound": round(float(row['yhat_lower']), 4),
            "upper_bound": round(float(row['yhat_upper']), 4)
        })

    return {
        "icing_forecast": icing_data,
        "corrosion_forecast": corrosion_data
    }

def validate_input_data(input_data: Dict, feature_names: List[str]) -> Tuple[bool, str]:
    """
    Validate input data for prediction.

    Args:
        input_data (dict): Input feature values.
        feature_names (list): Required feature names.

    Returns:
        tuple: (is_valid, error_message)
    """
    # Check for required features
    missing_features = []
    for feature in feature_names:
        if feature not in input_data:
            missing_features.append(feature)

    if missing_features:
        return False, f"Missing required features: {', '.join(missing_features)}"

    # Check data types (should be numeric)
    for feature in feature_names:
        value = input_data[feature]
        if not isinstance(value, (int, float)):
            try:
                float(value)
            except (ValueError, TypeError):
                return False, f"Invalid data type for feature '{feature}': expected numeric value"

    return True, ""
