import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import os

def load_training_data(data_path='backend/data/training_data.csv'):
    """
    Load and preprocess training data for XGBoost model.

    Args:
        data_path (str): Path to the training data CSV file.

    Returns:
        tuple: (X_train, X_test, y_train, y_test, feature_names)
    """
    # Load data
    df = pd.read_csv(data_path)

    # Separate features and target
    feature_cols = [
        'flight_hours', 'cycles', 'total_airframe_hours', 'engine_hours',
        'avg_altitude_ft', 'sector_length_nm', 'temperature_c', 'humidity_pct',
        'precipitation_mm', 'wind_speed_kts', 'turbulence_events', 'icing_reports',
        'visibility_km', 'sand_dust_index', 'days_since_last_maintenance',
        'maintenance_actions_last_year', 'component_age_hours', 'num_open_MEL_items',
        'recent_minor_defects', 'bird_strike_reports', 'runway_incident_report',
        'crew_hours_last_7days', 'turnaround_time_min'
    ]

    X = df[feature_cols]
    y = df['issue_type']

    # Handle missing values
    imputer = SimpleImputer(strategy='median')
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=X.columns)

    # Feature scaling
    scaler = StandardScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X_imputed), columns=X.columns)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    return X_train, X_test, y_train, y_test, feature_cols

def load_forecast_data(data_path='backend/data/forecast_data.csv'):
    """
    Load forecast data for Prophet models.

    Args:
        data_path (str): Path to the forecast data CSV file.

    Returns:
        tuple: (icing_df, corrosion_df)
    """
    df = pd.read_csv(data_path)
    df['ds'] = pd.to_datetime(df['ds'])

    icing_df = df[['ds', 'y_icing']].rename(columns={'y_icing': 'y'})
    corrosion_df = df[['ds', 'y_corrosion']].rename(columns={'y_corrosion': 'y'})

    return icing_df, corrosion_df

def preprocess_prediction_input(input_data, feature_names):
    """
    Preprocess input data for prediction.

    Args:
        input_data (dict): Input feature values.
        feature_names (list): List of feature names.

    Returns:
        pd.DataFrame: Preprocessed input data.
    """
    # Load training data to fit the scaler properly
    df_train = pd.read_csv('backend/data/training_data.csv')
    X_train = df_train[feature_names]

    # Fit scaler on training data
    scaler = StandardScaler()
    scaler.fit(X_train)

    # Convert single input to DataFrame
    df = pd.DataFrame([input_data])

    # Ensure all features are present and in correct order
    for feature in feature_names:
        if feature not in df.columns:
            df[feature] = 0
    df = df[feature_names]

    # Handle missing values (fit on training data, transform new data)
    imputer = SimpleImputer(strategy='median')
    imputer.fit(X_train)
    df_imputed = pd.DataFrame(imputer.transform(df), columns=df.columns)

    # Scale the new data using the scaler fitted on the training data
    df_scaled = pd.DataFrame(scaler.transform(df_imputed), columns=df.columns)

    return df_scaled

def get_feature_importance_map():
    """
    Get mapping of feature names to human-readable descriptions.

    Returns:
        dict: Feature name to description mapping.
    """
    return {
        'flight_hours': 'Flight Hours',
        'cycles': 'Flight Cycles',
        'total_airframe_hours': 'Total Airframe Hours',
        'engine_hours': 'Engine Hours',
        'avg_altitude_ft': 'Average Altitude (ft)',
        'sector_length_nm': 'Sector Length (nm)',
        'temperature_c': 'Temperature (°C)',
        'humidity_pct': 'Humidity (%)',
        'precipitation_mm': 'Precipitation (mm)',
        'wind_speed_kts': 'Wind Speed (kts)',
        'turbulence_events': 'Turbulence Events',
        'icing_reports': 'Icing Reports',
        'visibility_km': 'Visibility (km)',
        'sand_dust_index': 'Sand/Dust Index',
        'days_since_last_maintenance': 'Days Since Last Maintenance',
        'maintenance_actions_last_year': 'Maintenance Actions Last Year',
        'component_age_hours': 'Component Age (hours)',
        'num_open_MEL_items': 'Open MEL Items',
        'recent_minor_defects': 'Recent Minor Defects',
        'bird_strike_reports': 'Bird Strike Reports',
        'runway_incident_report': 'Runway Incident Reports',
        'crew_hours_last_7days': 'Crew Hours Last 7 Days',
        'turnaround_time_min': 'Turnaround Time (min)'
    }
