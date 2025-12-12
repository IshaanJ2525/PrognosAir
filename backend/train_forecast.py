from prophet import Prophet
import joblib
import os
import pandas as pd
from data_prep import load_forecast_data

def train_prophet_model(df, model_name):
    """
    Train Prophet model for time series forecasting.

    Args:
        df (pd.DataFrame): Time series data with 'ds' and 'y' columns.
        model_name (str): Name of the model (icing or corrosion).

    Returns:
        Prophet: Trained Prophet model.
    """
    # Initialize and fit Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        seasonality_mode='multiplicative'
    )

    model.fit(df)

    print(f"{model_name.capitalize()} Prophet model trained successfully.")
    return model

def save_prophet_model(model, model_path):
    """
    Save trained Prophet model.

    Args:
        model (Prophet): Trained Prophet model.
        model_path (str): Path to save the model.
    """
    # Create models directory if it doesn't exist
    os.makedirs(os.path.dirname(model_path), exist_ok=True)

    # Save model
    joblib.dump(model, model_path)
    print(f"Prophet model saved to {model_path}")

def forecast_future(model, periods=7):
    """
    Generate future forecasts.

    Args:
        model (Prophet): Trained Prophet model.
        periods (int): Number of days to forecast.

    Returns:
        pd.DataFrame: Forecast results.
    """
    # Create future dataframe
    future = model.make_future_dataframe(periods=periods)

    # Generate forecast
    forecast = model.predict(future)

    # Return only the forecasted period
    forecast_future = forecast.tail(periods)[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
    forecast_future['yhat'] = forecast_future['yhat'].clip(lower=0)  # Ensure non-negative values

    return forecast_future

def train_forecast_models():
    """
    Train Prophet models for icing and corrosion forecasting.

    Returns:
        tuple: (icing_model, corrosion_model)
    """
    # Load forecast data
    icing_df, corrosion_df = load_forecast_data()

    # Train icing model
    icing_model = train_prophet_model(icing_df, "icing")

    # Train corrosion model
    corrosion_model = train_prophet_model(corrosion_df, "corrosion")

    return icing_model, corrosion_model

if __name__ == "__main__":
    # Train models
    icing_model, corrosion_model = train_forecast_models()

    # Save models
    save_prophet_model(icing_model, 'models/icing_prophet_model.joblib')
    save_prophet_model(corrosion_model, 'models/corrosion_prophet_model.joblib')

    # Generate sample forecasts
    icing_forecast = forecast_future(icing_model, periods=7)
    corrosion_forecast = forecast_future(corrosion_model, periods=7)

    print("\nSample 7-day Icing Forecast:")
    print(icing_forecast.head())

    print("\nSample 7-day Corrosion Forecast:")
    print(corrosion_forecast.head())

    print("\nForecast training completed.")
