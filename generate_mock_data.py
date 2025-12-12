import json
import random

def get_issue_type_name(class_id):
    types = ['No Issue', 'Engine Degradation', 'Hydraulic Leak Risk', 'Avionics / Electrical Fault', 'Icing / Cold Weather Risk', 'Corrosion / Coating Deterioration']
    return types[class_id] if 0 <= class_id < len(types) else 'Unknown'

def generate_recommendation(predicted_class, top_features, part_data):
    recommendation = {
        "recommendation": "Monitor component.",
        "recommended_part": None,
        "confidence": round(random.uniform(0.7, 0.95), 2),
        "urgency": "Low",
        "modifiers": []
    }

    if predicted_class == 1: # Engine
        recommendation['recommendation'] = "Detailed boroscope inspection of engine turbine blades recommended."
        recommendation['recommended_part'] = "Engine_1_Turbine"
        recommendation['urgency'] = "Medium"
    elif predicted_class == 2: # Hydraulic
        recommendation['recommendation'] = "Inspect hydraulic lines for leaks and pressure test the system."
        recommendation['recommended_part'] = "Hydraulic_System_Main"
        recommendation['urgency'] = "High"
    elif predicted_class == 4: # Icing
        recommendation['recommendation'] = "Check de-icing systems and inspect wing leading edges for any damage."
        recommendation['recommended_part'] = "Wing_DeIcing_System"
        recommendation['urgency'] = "Medium"
    elif predicted_class == 5: # Corrosion
        recommendation['recommendation'] = "Inspect landing gear and fuselage sections for signs of corrosion or paint degradation."
        recommendation['recommended_part'] = "Landing_Gear_Assembly"
        recommendation['urgency'] = "Low"

    return recommendation

def generate_mock_predictions():
    predictions = []
    scenarios = [
      { 'name': 'Normal Long Haul', 'daysOffset': 1, 'destinationIndex': 0, 'flightHours': 10 + random.random() * 4, 'cycles': 1, 'altitude': 35000 + random.random() * 5000, 'sectorLength': 5000 + random.random() * 2000, 'weatherMultiplier': 1, 'partWear': 'balanced' },
      { 'name': 'Engine Stress', 'daysOffset': 7, 'destinationIndex': 1, 'flightHours': 12 + random.random() * 3, 'cycles': 1, 'altitude': 32000 + random.random() * 4000, 'sectorLength': 4500 + random.random() * 1500, 'weatherMultiplier': 1.2, 'partWear': 'engine' },
      { 'name': 'Hydraulic Load', 'daysOffset': 14, 'destinationIndex': 2, 'flightHours': 8 + random.random() * 4, 'cycles': 1, 'altitude': 30000 + random.random() * 3000, 'sectorLength': 3500 + random.random() * 1000, 'weatherMultiplier': 0.8, 'partWear': 'hydraulic' },
      { 'name': 'Cold Weather', 'daysOffset': 21, 'destinationIndex': 3, 'flightHours': 9 + random.random() * 3, 'cycles': 1, 'altitude': 28000 + random.random() * 2000, 'sectorLength': 4000 + random.random() * 1000, 'weatherMultiplier': 0.5, 'partWear': 'structural' },
      { 'name': 'High Humidity', 'daysOffset': 28, 'destinationIndex': 4, 'flightHours': 11 + random.random() * 4, 'cycles': 1, 'altitude': 33000 + random.random() * 4000, 'sectorLength': 4800 + random.random() * 2000, 'weatherMultiplier': 1.5, 'partWear': 'corrosion' }
    ]
    destinations = ['LHR', 'CDG', 'DXB', 'JFK', 'SIN', 'FRA', 'AMS', 'HKG', 'IST', 'LAX', 'NRT', 'ICN', 'BKK', 'KUL', 'CGK']
    today = __import__('datetime').datetime.now()

    for i, scenario in enumerate(scenarios):
        flight_date = today + __import__('datetime').timedelta(days=scenario['daysOffset'])
        date_str = flight_date.strftime('%Y-%m-%d')
        flight_num = str(1000 + i).zfill(4)
        destination = destinations[scenario['destinationIndex']]

        probabilities = [random.random() for _ in range(6)]
        total = sum(probabilities)
        probabilities = [p/total for p in probabilities]
        predicted_class = probabilities.index(max(probabilities))

        recommendation = generate_recommendation(predicted_class, [], {})

        flight_data = {
            "flight_id": f"SQ{flight_num}_{date_str}_{destination}",
            "destination": destination,
            "predicted_class": predicted_class,
            "probabilities": probabilities,
            "top_features": {},
            "recommendation": recommendation,
            "input_data": {
                "flight_hours": scenario['flightHours'],
                "cycles": scenario['cycles'],
                "avg_altitude_ft": scenario['altitude'],
                "sector_length_nm": scenario['sectorLength'],
            },
            "weather_data": {
                "is_extreme": random.random() > 0.8
            },
            "scenario": scenario['name']
        }
        predictions.append(flight_data)

    return predictions

if __name__ == "__main__":
    mock_data = generate_mock_predictions()
    with open('public/mock_predictions.json', 'w') as f:
        json.dump(mock_data, f, indent=4)
    print("Generated mock_predictions.json")

