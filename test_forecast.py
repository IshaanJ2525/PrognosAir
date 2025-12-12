import requests

# Test forecast endpoint
try:
    response = requests.get('http://localhost:8001/forecast')
    print('Forecast API Response:')
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('Success! Response contains:')
        print(f'- icing_forecast length: {len(result.get("icing_forecast", []))}')
        print(f'- corrosion_forecast length: {len(result.get("corrosion_forecast", []))}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error calling API: {e}')
