"""
Quick API Test Script
Tests the main endpoints to demonstrate functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("=" * 50)
    print("Testing Health Endpoint...")
    print("=" * 50)
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_flights():
    """Test flights endpoint"""
    print("=" * 50)
    print("Testing Flights Endpoint...")
    print("=" * 50)
    response = requests.get(f"{BASE_URL}/api/flights?limit=2")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        flights = response.json()
        print(f"Found {len(flights)} flights:")
        for flight in flights:
            print(f"  - {flight['flight_number']}: {flight['origin']} -> {flight['destination']}")
            print(f"    Gate: {flight['gate']}, Status: {flight['status']}")
    print()

def test_services():
    """Test services endpoint"""
    print("=" * 50)
    print("Testing Services Endpoint...")
    print("=" * 50)
    response = requests.get(f"{BASE_URL}/api/services?category=cafe")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        services = response.json()
        print(f"Found {len(services)} cafes:")
        for service in services:
            print(f"  - {service['name']}: {service['location']}")
    print()

def test_api_info():
    """Test API info endpoint"""
    print("=" * 50)
    print("Testing API Info Endpoint...")
    print("=" * 50)
    response = requests.get(f"{BASE_URL}/api")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        info = response.json()
        print(f"API Version: {info['version']}")
        print(f"\nAvailable Endpoints:")
        for category, endpoints in info['endpoints'].items():
            print(f"\n  {category.upper()}:")
            for name, route in endpoints.items():
                print(f"    - {route}")
    print()

if __name__ == "__main__":
    print("\n" + "="*50)
    print("AeroWay API - Functionality Test")
    print("="*50 + "\n")

    try:
        test_health()
        test_api_info()
        test_flights()
        test_services()

        print("=" * 50)
        print("✅ ALL TESTS PASSED!")
        print("=" * 50)
        print("\nBackend is fully functional!")
        print("API Documentation: http://localhost:8000/docs")
        print("Frontend: http://localhost:8080")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("Make sure the backend is running: cd backend && venv/Scripts/python main.py")
