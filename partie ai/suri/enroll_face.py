import base64
import requests
import json
import time

DETECT_URL = "http://localhost:8000/detect"
REGISTER_URL = "http://localhost:8000/face/register"
IMAGE_PATH = "face.jpg"

def img_data_url(path: str) -> str:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return "data:image/jpeg;base64," + b64

def main():
    image = img_data_url(IMAGE_PATH)

    # 1) Detect
    det = requests.post(DETECT_URL, json={"image": image}, timeout=30)
    det.raise_for_status()
    det_json = det.json()
    if not det_json.get("success") or not det_json.get("faces"):
        print("❌ No face detected")
        print(json.dumps(det_json, indent=2))
        return

    face = det_json["faces"][0]
    bbox = face["bbox"]
    landmarks_5 = face["landmarks_5"]

    # 2) Register (with bbox + landmarks)
    person_id = f"student_{int(time.time())}"

    payload = {
        "person_id": person_id,
        "image": image,
        "bbox": bbox,
        "enable_liveness_detection": False,
        "landmarks_5": landmarks_5
    }

    reg = requests.post(REGISTER_URL, json=payload, timeout=30)
    reg.raise_for_status()
    reg_json = reg.json()

    print("Register status:", reg.status_code)
    print(json.dumps(reg_json, indent=2))

if __name__ == "__main__":
    main()
