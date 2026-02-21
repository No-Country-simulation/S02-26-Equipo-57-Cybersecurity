import requests

def test_scan_endpoint():
    url = "http://localhost:8000/scan"
    payload = {
        "target_url": "http://example.com",
        "scan_type": "full"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("✅ Scan Request Successful:")
        print(response.json())
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Security Engine: {e}")

if __name__ == "__main__":
    test_scan_endpoint()
