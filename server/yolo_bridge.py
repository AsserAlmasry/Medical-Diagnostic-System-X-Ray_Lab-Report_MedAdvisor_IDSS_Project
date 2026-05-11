import sys
import os
import json
from ultralytics import YOLO

def analyze_xray(image_path):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "..", "yolo_model.pt")
    
    if not os.path.exists(model_path):
        return {"error": f"Model weights not found at {model_path}."}

    try:
        model = YOLO(model_path)
        results = model.predict(image_path, conf=0.2, verbose=False) # Lowered threshold slightly for better coverage
        
        detections = []
        max_conf = 0.0
        
        if results and len(results[0].boxes) > 0:
            for box in results[0].boxes:
                label = model.names[int(box.cls[0])]
                conf = float(box.conf[0])
                detections.append({
                    "class": label,
                    "confidence": round(conf * 100, 1)
                })
                if conf > max_conf:
                    max_conf = conf
        
        # Save annotated image
        annotated_path = image_path.replace(".jpeg", "_annotated.jpeg").replace(".jpg", "_annotated.jpg").replace(".png", "_annotated.png")
        results[0].save(filename=annotated_path)

        return {
            "detections": detections,
            "max_confidence": round(max_conf * 100, 1),
            "annotated_image_path": annotated_path,
            "status": "Neural Engine Online"
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    img_path = sys.argv[1]
    result = analyze_xray(img_path)
    print(json.dumps(result))
