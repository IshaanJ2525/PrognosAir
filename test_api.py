import json
import requests

# Test predict endpoint with proper JSON
data = {
    'flight_hours': 5.0,
    'cycles': 2,
    'total_airframe_hours': 15000,
    'engine_hours': 8000,
    'avg_altitude_ft': 35000,
    'sector_length_nm': 3000,
    'temperature_c': 15,
    'humidity_pct': 60,
    'precipitation_mm': 0,
    'wind_speed_kts': 20,
    'turbulence_events': 1,
    'icing_reports': 0,
    'visibility_km': 10,
    'sand_dust_index': 10,
    'days_since_last_maintenance': 30,
    'maintenance_actions_last_year': 2,
    'component_age_hours': 5000,
    'num_open_MEL_items': 1,
    'recent_minor_defects': 2,
    'bird_strike_reports': 0,
    'runway_incident_report': 0,
    'crew_hours_last_7days': 40,
    'turnaround_time_min': 45,
    'part_data': {
        'Engine_1': {'usedHours': 8000, 'maxHours': 10000},
        'Engine_2': {'usedHours': 7500, 'maxHours': 10000},
        'Hydraulic_Pump_1': {'usedHours': 6000, 'maxHours': 8000},
        'Landing_Gear': {'usedHours': 5000, 'maxHours': 7000}
    }
}

try:
    response = requests.post('http://localhost:8001/predict', json=data)
    print('Predict API Response:')
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('Success! Response contains:')
        print(f'- predicted_class: {result.get("predicted_class")}')
        print(f'- probabilities length: {len(result.get("probabilities", []))}')
        print(f'- top_features length: {len(result.get("top_features", []))}')
        print(f'- recommendation: {bool(result.get("recommendation"))}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error calling API: {e}')
