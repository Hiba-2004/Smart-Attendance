import base64
import requests
import json

SURI_URL = "http://localhost:8000/detect"
IMAGE_PATH = "face.jpg"

with open(IMAGE_PATH, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

payload = {
    "image": "data:image/jpeg;base64," + b64
}

r = requests.post(SURI_URL, json=payload, timeout=30)

print("Status:", r.status_code)
print(json.dumps(r.json(), indent=2))
