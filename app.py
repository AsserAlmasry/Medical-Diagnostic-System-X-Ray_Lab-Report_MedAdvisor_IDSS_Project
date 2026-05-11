import streamlit as st
import os
import tempfile
from PIL import Image

# Import custom modules
from utils import render_custom_css, get_risk_badge, render_disclaimer, render_medicine_card
from xray_model import analyze_xray
from lab_agent import load_document, analyze_lab_report
from medadvisor_agent import analyze_medication

st.set_page_config(page_title="MedAI Insight", page_icon="🩺", layout="wide")

def main():
    render_custom_css()
    
    st.sidebar.title("🚀 MedAI Insight")
    st.sidebar.markdown("*Next-Gen Diagnostic Suite*")
    
    st.sidebar.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)
    app_mode = st.sidebar.selectbox("Choose Mode", ["🩻 X-ray Analysis", "🧪 Lab Report Interpreter", "💊 MedAdvisor Egypt (Pharmacy)", "📊 Patient Summary"])
    st.sidebar.markdown("<hr style='border: 0.5px solid rgba(255,255,255,0.05); margin: 30px 0;'>", unsafe_allow_html=True)
    st.sidebar.subheader("⚙️ Settings")
    
    is_doctor = st.sidebar.toggle("Doctor-Level Explanation", value=False)
    gemini_key = st.sidebar.text_input("Gemini API Key (Optional for Agent)", value="AIzaSyB2anp7Cai8XMcgOlZ6L0BZD4HjMfp9_0M", type="password", help="Providing this uses Gemini for advanced clinical reasoning.")
    gemini_model = st.sidebar.selectbox("Gemini Model Version", ["gemini-3-flash-preview", "gemini-3.0-flash", "gemini-3.1-pro", "gemini-2.5-flash", "gemini-2.0-flash"], index=0)
    
    if app_mode == "🩻 X-ray Analysis":
        st.title("🩻 Chest X-ray AI Analysis")
        st.markdown("Upload a chest X-ray image for AI-driven anomaly detection.")
        
        uploaded_image = st.file_uploader("Upload X-ray Image (PNG, JPG, JPEG)", type=["png", "jpg", "jpeg"])
        
        if uploaded_image is not None:
            image = Image.open(uploaded_image).convert("RGB")
            
            # Display uploaded image
            st.image(image, caption="Uploaded X-ray", width=400)
            
            if st.button("Run AI Analysis", type="primary"):
                with st.spinner("Analyzing image... (this may take a moment)"):
                    results = analyze_xray(image, use_yolo=True)
                
                st.success("Analysis Complete!")
                
                st.markdown("---")
                col1, col2 = st.columns([1, 1])
                
                with col1:
                    st.subheader("Diagnostic Results")
                    st.markdown(f"**Risk Level:** {get_risk_badge(results.get('risk_level', 'Unknown'))}", unsafe_allow_html=True)
                    st.markdown(f"**Confidence Score:** `{results.get('confidence_score', 0)}%`")
                    
                    st.markdown("#### Detected Issues:")
                    issues = results.get('detected_issues', [])
                    if issues:
                        for issue in issues:
                            st.write(f"- {issue}")
                    else:
                        st.write("No specific issues detected by AI.")
                        
                    st.markdown("#### Summary Interpretation:")
                    st.info(results.get('summary', ''))
                    
                with col2:
                    st.subheader("Annotated X-ray")
                    if 'annotated_image' in results:
                        st.image(results['annotated_image'], caption="AI Bounding Boxes", use_column_width=True)

    
    elif app_mode == "🧪 Lab Report Interpreter":
        st.title("🧪 Lab Report Smart Interpreter")
        st.markdown("Upload lab results (PDF, CSV, TXT, Images) and let the Smart Agent interpret them.")
        
        uploaded_file = st.file_uploader("Upload Lab Document (PDF, CSV, TXT, PNG, JPG, JPEG)", type=["pdf", "csv", "txt", "png", "jpg", "jpeg"])
        
        if uploaded_file is not None:
            st.info(f"Uploaded: {uploaded_file.name}")
            
            if st.button("Interpret Results", type="primary"):
                # Save file temporarily to use with Langchain loaders
                ext = os.path.splitext(uploaded_file.name)[-1].lower()
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
                    temp_file.write(uploaded_file.read())
                    temp_path = temp_file.name
                
                with st.spinner("Extracting information and reasoning..."):
                    try:
                        if ext in [".png", ".jpg", ".jpeg"]:
                            st.image(temp_path, caption="Uploaded Lab Image", width=400)
                            results = analyze_lab_report(image_path=temp_path, gemini_api_key=gemini_key, is_doctor=is_doctor, model_name=gemini_model)
                        else:
                            text_data = load_document(temp_path)
                            results = analyze_lab_report(text=text_data, gemini_api_key=gemini_key, is_doctor=is_doctor, model_name=gemini_model)
                    except Exception as e:
                        st.error(f"Error processing document: {e}")
                        results = None
                    finally:
                        # Clean up temp file
                        if os.path.exists(temp_path):
                            os.remove(temp_path)
                
                if results:
                    st.success("Interpretation Complete!")
                    st.markdown("---")
                    
                    # Layout
                    st.markdown(f"**Overall Risk Level:** {get_risk_badge(results.get('risk_level', 'Unknown'))}", unsafe_allow_html=True)
                    
                    tab1, tab2, tab3 = st.tabs(["📝 Summary", "🚨 Anomalies", "💡 Recommendations"])
                    
                    with tab1:
                        if is_doctor:
                            st.write("*(Clinical Terminology Mode Active)*")
                        st.markdown(f"> {results.get('summary', 'No summary available.')}")
                        
                    with tab2:
                        issues = results.get("detected_issues", [])
                        if issues:
                            for issue in issues:
                                st.warning(issue)
                        else:
                            st.success("No abnormal values detected.")
                            
                    with tab3:
                        recs = results.get("recommendations", [])
                        if recs:
                            for rec in recs:
                                st.info(rec)
                        else:
                            st.write("No specific recommendations provided.")

    elif app_mode == "💊 MedAdvisor Egypt (Pharmacy)":
        st.title("💊 MedAdvisor Egypt")
        st.markdown("Intelligent Pharmaceutical DSS specialized in the Egyptian drug market.")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            med_query = st.text_input("Medication Name (Brand or Generic)", placeholder="e.g., Euthyrox, Panadol, or Metformin")
            patient_conditions = st.text_area("Patient Conditions / Chronic Diseases (Optional)", placeholder="e.g., Diabetes, Hypertension, Pregnancy")
        
        with col2:
            st.info("💡 **Shortage Tip:** If you can't find a medicine, MedAdvisor will suggest equivalent local generics.")
            is_pharmacist_user = st.toggle("I am a Pharmacist", help="Enables clinical detail and EDA registration info.")

        if st.button("Check Medication & Substitutes", type="primary"):
            if not med_query:
                st.warning("Please enter a medication name.")
            elif not gemini_key:
                st.error("Please provide a Gemini API Key in the sidebar to use MedAdvisor.")
            else:
                with st.spinner("Consulting Egyptian drug database..."):
                    advice = analyze_medication(
                        query=med_query,
                        conditions=patient_conditions,
                        is_pharmacist=is_pharmacist_user,
                        gemini_api_key=gemini_key,
                        model_name=gemini_model
                    )
                
                st.markdown("---")
                st.subheader("📋 MedAdvisor Assessment")
                
                if isinstance(advice, dict) and "error" not in advice:
                    # Header Info
                    st.markdown(f"**Medication Searched:** `{advice.get('medication_searched', med_query)}`")
                    st.markdown(f"**Shortage Status:** {advice.get('shortage_status', 'Unknown')}")
                    st.markdown(f"**Doctor Review Required:** {advice.get('doctor_review_required', 'Unknown')}")
                    
                    st.markdown("### 💊 Recommended Substitutes")
                    substitutes = advice.get('substitutes', [])
                    if substitutes:
                        # Render substitutes in columns
                        cols = st.columns(len(substitutes))
                        for i, sub in enumerate(substitutes):
                            with cols[i]:
                                render_medicine_card(
                                    name=sub.get('name', 'Unknown'),
                                    manufacturer=sub.get('manufacturer', 'Local Manufacturer'),
                                    reason=sub.get('reason', ''),
                                    image_url=None # Placeholder used in util
                                )
                    else:
                        st.info("No specific substitutes recommended.")
                    
                    # Notes & Disclaimer
                    if advice.get('notes'):
                        st.markdown("### 📝 Clinical Notes")
                        for note in advice['notes']:
                            st.write(f"- {note}")
                    
                    st.warning(advice.get('disclaimer', "This advice does not replace a doctor's prescription."))
                else:
                    st.error(f"Failed to get structured advice: {advice.get('error') if isinstance(advice, dict) else advice}")

    elif app_mode == "📊 Patient Summary":
        st.title("📊 Neural Patient Profile")
        st.markdown("""
        <div style="background: rgba(255,255,255,0.05); padding: 40px; border-radius: 20px; border: 1px dashed rgba(0,242,255,0.3); text-align: center;">
            <h2 style="color: #00f2ff; margin-bottom: 20px;">🔒 Data Synchronization in Progress</h2>
            <p style="color: rgba(255,255,255,0.7);">Our neural engine is preparing to aggregate your longitudinal health data into a unified, AI-driven timeline.</p>
            <div style="margin-top: 30px; display: flex; justify-content: center; gap: 20px;">
                <div style="padding: 15px 25px; background: rgba(0,242,255,0.1); border-radius: 10px; color: #00f2ff; font-weight: 600;">Imaging History</div>
                <div style="padding: 15px 25px; background: rgba(112,0,255,0.1); border-radius: 10px; color: #7000ff; font-weight: 600;">Lab Trends</div>
                <div style="padding: 15px 25px; background: rgba(255,255,255,0.05); border-radius: 10px; color: #fff; font-weight: 600;">Genomic Sync</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

    render_disclaimer()

if __name__ == "__main__":
    main()
