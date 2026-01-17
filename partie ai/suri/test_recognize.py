import base64
import requests
import json

DETECT_URL = "http://localhost:8000/detect"
RECOGNIZE_URL = "http://localhost:8000/face/recognize"
IMAGE_PATH = "face.jpg"

def img_to_data_url(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

image = img_to_data_url(IMAGE_PATH)

# 1) Detect
det = requests.post(DETECT_URL, json={"image": image}, timeout=30)
print("Detect status:", det.status_code)
det_json = det.json()
print(json.dumps(det_json, indent=2))

if not det_json.get("success") or not det_json.get("faces"):
    print("❌ No face detected, cannot recognize.")
    raise SystemExit(1)

face = det_json["faces"][0]
bbox = face["bbox"]
landmarks_5 = face.get("landmarks_5", [])

# 2) Recognize (requires bbox)
payload = {
    "image": image,
    "bbox": bbox,
    "landmarks_5": landmarks_5
}

rec = requests.post(RECOGNIZE_URL, json=payload, timeout=30)
print("\nRecognize status:", rec.status_code)
print(json.dumps(rec.json(), indent=2))
