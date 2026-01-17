import base64
import requests
import json
import time
import sys

DETECT_URL = "http://localhost:8000/detect"
REGISTER_URL = "http://localhost:8000/face/register"

def img_data_url(path: str) -> str:
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    return "data:image/jpeg;base64," + b64

def main():
    if len(sys.argv) < 3:
        print("Usage: python enroll_face_with_student.py <student_id> <image_path>")
        print("Example: python enroll_face_with_student.py 45 face.jpg")
        return

    student_id = sys.argv[1]
    image_path = sys.argv[2]
    image = img_data_url(image_path)

    # 1) detect
    det = requests.post(DETECT_URL, json={"image": image}, timeout=30)
    det.raise_for_status()
    det_json = det.json()

    if not det_json.get("success") or not det_json.get("faces"):
        print(json.dumps(det_json, indent=2))
        print("❌ No face detected. Use a clearer photo.")
        return

    face = det_json["faces"][0]
    bbox = face["bbox"]
    landmarks_5 = face["landmarks_5"]

    # 2) register
    # we store student_id inside person_id to simplify mapping
    person_id = f"student_{student_id}"

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

    print(json.dumps(reg_json, indent=2))

    if reg_json.get("success"):
        print(f"\n✅ SUCCESS: Save this mapping in MySQL -> users.suri_person_id = '{person_id}'")

if __name__ == "__main__":
    main()
