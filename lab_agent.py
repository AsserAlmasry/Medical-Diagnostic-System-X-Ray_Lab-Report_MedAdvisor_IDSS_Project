import os
import streamlit as st
try:
    from google import genai
except ImportError as e:
    st.error(f"google-genai ImportError context: {e}")

from PIL import Image
from langchain_community.document_loaders import PyPDFLoader, CSVLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_document(file_path: str):
    """Loads a document using the appropriate LangChain loader."""
    ext = os.path.splitext(file_path)[-1].lower()
    
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext == ".csv":
        loader = CSVLoader(file_path)
    elif ext == ".txt":
        loader = TextLoader(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")
    
    docs = loader.load()
    
    # Split text into manageable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    splits = text_splitter.split_documents(docs)
    
    return " ".join([d.page_content for d in splits])


def analyze_lab_report(text: str = None, image_path: str = None, gemini_api_key: str = None, is_doctor: bool = False, model_name: str = "gemini-2.0-flash"):
    """
    Uses an LLM to analyze lab report text or an image.
    Returns: Dict with summary, risk, recommendations.
    """
    if not text and not image_path:
        return {
            "summary": "No document or image provided.",
            "risk_level": "Unknown",
            "recommendations": []
        }
        
    if not gemini_api_key:
        # Fallback pseudo-logic if no API key is provided
        st.warning("No Gemini API Key provided. Using rule-based mock analysis.")
        text_lower = text.lower()
        risk = "Low"
        issues = []
        if "high" in text_lower or "abnormal" in text_lower or "elevated" in text_lower:
            risk = "Medium"
            issues.append("Detected potential abnormalities based on keywords ('high', 'abnormal').")
        if "critical" in text_lower or "severe" in text_lower:
            risk = "High"
            issues.append("Detected critical keywords indicating severe issues.")
            
        return {
            "summary": "Simulated AI Analysis based on Medical Keyword Extraction.",
            "detected_issues": issues if issues else ["No major keywords detected."],
            "risk_level": risk,
            "recommendations": ["Consult physician", "Provide API key for semantic analysis."]
        }
        
    try:
        client = genai.Client(api_key=gemini_api_key)
        
        audience = "a medical doctor using clinical terminology" if is_doctor else "a patient using simple, easy to understand language"
        
        system_instructions = f'''
            You are an expert AI medical assistant. Analyze the provided lab report for {audience}.
            
            Extract the following:
            1. Key Findings: Summary of test results.
            2. Anomalies: Any values outside normal reference ranges.
            3. Risk Level: Classify as Low, Medium, or High strictly.
            4. Recommendations: What should be done next.
            
            Format your response exactly as:
            SUMMARY: [summary text]
            ISSUES: [issue1 | issue2]
            RISK: [Low/Medium/High]
            RECOMMENDATIONS: [rec1 | rec2]
            '''
            
        contents = [system_instructions]
            
        if image_path:
            image_obj = Image.open(image_path)
            contents.append("Please extract and analyze the lab test numbers from this image:")
            contents.append(image_obj)
        else:
            contents.append(f"Lab Report Text:\n{text}")
            
        generation = client.models.generate_content(
            model=model_name,
            contents=contents
        )
        response = generation.text
        
        # Parse response
        parsed = {
            "summary": "Analysis generated.",
            "detected_issues": [],
            "risk_level": "Unknown",
            "recommendations": []
        }
        
        for line in response.split('\n'):
            line = line.strip()
            if line.startswith("SUMMARY:"):
                parsed["summary"] = line.replace("SUMMARY:", "").strip()
            elif line.startswith("ISSUES:"):
                issues_raw = line.replace("ISSUES:", "").strip()
                parsed["detected_issues"] = [i.strip() for i in issues_raw.split('|') if i.strip()]
            elif line.startswith("RISK:"):
                parsed["risk_level"] = line.replace("RISK:", "").strip()
            elif line.startswith("RECOMMENDATIONS:"):
                recs_raw = line.replace("RECOMMENDATIONS:", "").strip()
                parsed["recommendations"] = [r.strip() for r in recs_raw.split('|') if r.strip()]
                
        return parsed
        
    except Exception as e:
        return {
            "summary": f"Failed to run LLM chain: {e}",
            "risk_level": "Unknown",
            "recommendations": []
        }
