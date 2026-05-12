# MedAI Insight v2.2 - Professional Full-Stack IDSS 🏥

MedAI Insight is a state-of-the-art **Intelligent Decision Support System (IDSS)** designed to assist healthcare professionals in diagnostic clinical reasoning. By combining advanced Computer Vision (YOLO) with Large Language Models (Groq Llama 3.3 70B), the system provides high-precision analysis of medical imaging, lab results, and pharmaceutical queries.

🚀 **Link for the recorded video of the project:** [Watch Demo on Google Drive](https://drive.google.com/file/d/1lGO2xJRwzzxr5qNQEDrTHhP1mkD34CyW/view?usp=sharing)

---

## 🧠 Understanding IDSS in this Project

### What is an IDSS?
An **Intelligent Decision Support System (IDSS)** is an advanced software framework that uses AI and data analytics to assist humans in making complex decisions. In healthcare, an IDSS doesn't replace the doctor; it acts as a "second set of eyes" and a "clinical memory" that can process massive amounts of data in seconds.

### What the IDSS Layer does in this project?
The **IDSS Layer** is the "Neural Bridge" of this application. It performs three critical functions:
1.  **Multi-Modal Perception**: It converts raw medical data (X-ray images and scanned lab reports) into structured information using YOLO12 and local OCR engines.
2.  **Clinical Reasoning**: It passes this structured data to a High-Intelligence Core (Llama 3.3 70B) which applies medical knowledge to identify risks and suggest interventions.
3.  **Actionable Intelligence**: Instead of just showing "numbers," it provides a risk-leveled summary, manufacturer-specific medication substitutes (Egyptian market), and clinical recommendations.

---

## ✨ Core Features

### 🩻 Chest X-ray AI Analysis
- **Neural Engine**: Uses a specialized YOLO12 model for anomaly detection.
*   **Visual Feedback**: Generates annotated heatmaps and bounding boxes for clinical verification.
*   **Confidence Logic**: Provides high-certainty "Normal" verification or anomaly flagging.

### 🧪 Lab Report Smart Interpreter
- **Hybrid OCR**: Local text extraction from images (EasyOCR) ensuring privacy and speed.
- **Agentic Reasoning**: Interprets complex blood panels and biochemical markers for both doctors and patients.

### 💊 MedAdvisor Egypt
- **Pharmaceutical DSS**: Specialized in the Egyptian drug market and EDA-registered brands.
- **Shortage Management**: Provides bioequivalent local substitutes with exact dosage instructions.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Framer Motion, Lucide Icons, Vite.
- **Backend**: Node.js (Express), Multer, Axios.
- **AI Core**: Groq Cloud SDK (Llama 3.3 70B & Llama 3.2 Vision).
- **Vision/OCR**: Python (Ultralytics YOLO, EasyOCR, OpenCV).

---

## 🚀 Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/AsserAlmasry/Medical-Diagnostic-System-X-Ray_Lab-Report_MedAdvisor_IDSS_Project.git
    ```

2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Create a .env file with: GROQ_API_KEY=your_key
    node server.js
    ```

3.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

## 🔒 Security
All AI API keys are stored server-side in environment variables. No sensitive data is exposed to the client-side frontend, ensuring HIPAA-compliant architectural patterns.

---
🚀 **Made by: Asser Almasry | AI Engineer | All Rights Saved**
---
*Disclaimer: This system is for educational and demonstrational purposes only. It does not replace professional medical advice.*
