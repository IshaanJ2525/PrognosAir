import requests

# Test features endpoint
try:
    response = requests.get('http://localhost:8001/features')
    print('Features API Response:')
    print(f'Status Code: {response.status_code}')
    if response.status_code == 200:
        result = response.json()
        print('Success! Response contains:')
        print(f'- features length: {len(result.get("features", []))}')
    else:
        print(f'Error: {response.text}')
except Exception as e:
    print(f'Error calling API: {e}')
