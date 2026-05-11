import os
from PIL import Image
import torch
import streamlit as st

# We wrap YOLO import in try-except to handle potential missing attributes gracefully
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

try:
    from transformers import pipeline
except ImportError:
    pipeline = None

YOLO_MODEL_PATH = "yolo_model.pt"

@st.cache_resource
def load_yolo_model():
    """Loads the YOLO model for Chest X-ray analysis."""
    if YOLO is None:
        raise ImportError("ultralytics library is not installed.")
    
    if os.path.exists(YOLO_MODEL_PATH):
        try:
            model = YOLO(YOLO_MODEL_PATH)
            return model
        except Exception as e:
            st.error(f"Error loading YOLO model: {e}")
            return None
    else:
        st.warning(f"YOLO model not found at {YOLO_MODEL_PATH}. Detection might bypass YOLO.")
        return None

@st.cache_resource
def load_vlm_model():
    """Loads a lightweight VLM fallback model (BLIP) for general medical image description."""
    if pipeline is None:
        return None
    try:
        # Using a small image captioning model as a lightweight VLM
        vlm = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
        return vlm
    except Exception as e:
        print(f"Failed to load VLM: {e}")
        return None

def analyze_xray(image: Image.Image, use_yolo=True):
    """
    Analyzes an X-Ray using YOLO (if available) and VLM.
    image: PIL Image
    Returns: Dict containing Summary, Detected Issues, Risk Level, and annotated Image.
    """
    results_dict = {
        "summary": "Analysis could not be completed.",
        "detected_issues": [],
        "risk_level": "Low",
        "annotated_image": image,
        "confidence_score": 0.0
    }
    
    yolo_model = load_yolo_model() if use_yolo else None
    
    if yolo_model is not None:
        # Run YOLO prediction
        results = yolo_model.predict(image, conf=0.25)
        
        detected_classes = []
        confidences = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                # We assume yolo_model.names is a dict mapping id to class name
                cls_name = yolo_model.names[cls_id] if hasattr(yolo_model, 'names') and cls_id in yolo_model.names else f"Class {cls_id}"
                
                detected_classes.append(cls_name)
                confidences.append(conf)
        
            # If we want the annotated image natively from ultralytics:
            if len(boxes) > 0:
                res_plotted = r.plot()  # numpy array (BGR usually)
                try:
                    import cv2
                    res_plotted_rgb = cv2.cvtColor(res_plotted, cv2.COLOR_BGR2RGB)
                    results_dict["annotated_image"] = Image.fromarray(res_plotted_rgb)
                except:
                    results_dict["annotated_image"] = Image.fromarray(res_plotted)
        
        if detected_classes:
            unique_issues = list(set(detected_classes))
            avg_conf = sum(confidences) / len(confidences)
            results_dict["detected_issues"] = unique_issues
            results_dict["confidence_score"] = round(avg_conf * 100, 2)
            results_dict["summary"] = f"YOLO model detected {len(detected_classes)} potential abnormalities: {', '.join(unique_issues)}."
            results_dict["risk_level"] = "High" if len(unique_issues) >= 2 else "Medium"
        else:
            results_dict["summary"] = "No obvious abnormalities detected by YOLO model."
            results_dict["risk_level"] = "Low"
            results_dict["confidence_score"] = 90.0 # Assumed high confidence of nothing found
            
    else:
        # Fallback to VLM if YOLO is not present or failed to load
        vlm = load_vlm_model()
        if vlm:
            out = vlm(image)
            description = out[0]['generated_text']
            results_dict["summary"] = f"VLM Description: {description}. Model is untrained for diagnostics, manual review required."
            results_dict["risk_level"] = "Unknown"
        else:
            results_dict["summary"] = "No models available for analysis."
            
    return results_dict
