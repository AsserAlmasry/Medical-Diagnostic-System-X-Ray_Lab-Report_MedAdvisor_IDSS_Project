import sys
import easyocr
import json
import os

def extract_text(image_path):
    try:
        reader = easyocr.Reader(['en'])
        result = reader.readtext(image_path)
        full_text = " ".join([res[1] for res in result])
        return {"text": full_text}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    img_path = sys.argv[1]
    result = extract_text(img_path)
    print(json.dumps(result))
