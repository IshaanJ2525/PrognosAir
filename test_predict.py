from backend.utils import load_xgboost_model
model = load_xgboost_model()
print('Model loaded:', model is not None)
if model:
    print('base_score:', getattr(model, 'base_score', 'Not found'))
    print('Trying to predict...')
    import pandas as pd
    # Use proper column names
    columns = ['flight_hours', 'cycles', 'total_airframe_hours', 'engine_hours', 'avg_altitude_ft', 'sector_length_nm', 'temperature_c', 'humidity_pct', 'precipitation_mm', 'wind_speed_kts', 'turbulence_events', 'icing_reports', 'visibility_km', 'sand_dust_index', 'days_since_last_maintenance', 'maintenance_actions_last_year', 'component_age_hours', 'num_open_MEL_items', 'recent_minor_defects', 'bird_strike_reports', 'runway_incident_report', 'crew_hours_last_7days', 'turnaround_time_min']
    X = pd.DataFrame([[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]], columns=columns)
    try:
        pred = model.predict(X)
        print('Prediction successful:', pred)
    except Exception as e:
        print('Prediction error:', e)
