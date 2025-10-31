"""Debug script to see actual error messages"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing Flights Endpoint...")
try:
    r = requests.get(f"{BASE_URL}/api/flights?limit=2")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

print("Testing Services Endpoint...")
try:
    r = requests.get(f"{BASE_URL}/api/services?category=cafe")
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
