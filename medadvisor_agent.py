import os
import streamlit as st
try:
    from google import genai
except ImportError as e:
    st.error(f"google-genai ImportError context: {e}")

def analyze_medication(query: str, conditions: str = "", is_pharmacist: bool = False, gemini_api_key: str = None, model_name: str = "gemini-2.0-flash"):
    """
    Uses an LLM to provide medication advice specialized in the Egyptian market.
    """
    if not query:
        return "Please provide a medication name to search."

    if not gemini_api_key:
        return "Gemini API Key is required for MedAdvisor analysis."

    try:
        client = genai.Client(api_key=gemini_api_key)
        
        mode_instruction = ""
        if is_pharmacist:
            mode_instruction = "PHARMACIST MODE: Provide clinical details including EDA registration numbers, manufacturer info, and bulk availability notes."
        
        system_instructions = f'''
            You are MedAdvisor Egypt — an intelligent pharmaceutical DSS specialized in the Egyptian drug market.
            
            You have expert knowledge of:
            - Egyptian Drug Authority (EDA) registered medications
            - Generic vs. brand-name drug equivalences
            - Active pharmaceutical ingredients (APIs) and therapeutic substitutes
            - Common medication shortages in Egypt due to import/currency challenges
            - Egyptian pharmacy landscape and availability patterns

            Your capabilities:
            1. SHORTAGE DETECTION: When a user reports a medication is unavailable, acknowledge the shortage and flag it as a data point.
            2. SUBSTITUTE RECOMMENDATION: Suggest medically equivalent alternatives available in Egypt, ranked by:
               - Same active ingredient (generic alternatives first)
               - Same therapeutic class (if no generic exists)
               - Local Egyptian manufacturers preferred over imports
               - Similar dosage forms and strengths
            3. SAFETY FLAGGING: Always include:
               - ⚠️ Doctor-review flag for: chronic disease meds, narrow therapeutic index drugs, pediatric doses, etc.
               - 💊 Bioequivalence notes when relevant
               - 🚫 Contraindication warnings if the patient mentions conditions: {conditions}
            4. PATIENT-FRIENDLY LANGUAGE: Respond in simple Arabic or English depending on the user's language. Be warm, clear, and non-alarming.
            5. {mode_instruction}

            You MUST return your response in a valid JSON format with the following structure:
            {{
                "medication_searched": "name",
                "shortage_status": "status",
                "substitutes": [
                    {{
                        "name": "drug name",
                        "reason": "why it is recommended",
                        "manufacturer": "company name",
                        "active_ingredient": "ingredients"
                    }}
                ],
                "doctor_review_required": "Yes ⚠️ / No",
                "notes": ["note 1", "note 2"],
                "disclaimer": "This advice does not replace a doctor's prescription. Please consult your physician before switching medications."
            }}
            '''
            
        generation = client.models.generate_content(
            model=model_name,
            contents=[system_instructions, f"Medication Query: {query}"],
            config={
                'response_mime_type': 'application/json',
            }
        )
        
        import json
        return json.loads(generation.text)
        
    except Exception as e:
        return {"error": f"Error connecting to AI service: {e}"}
