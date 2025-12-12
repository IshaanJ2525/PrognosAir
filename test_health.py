import requests

# Test health endpoint
try:
    response = requests.get('http://localhost:8001/health')
    print('Health API Response:')
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('Success! Response contains:')
        print(f'- status: {result.get("status")}')
        print(f'- models_loaded: {result.get("models_loaded")}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error calling API: {e}')
