require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Groq } = require('groq-sdk');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 5000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Setup storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Helper to run python script
const runPython = (script, args) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python', [script, ...args]);
    let data = '';
    let error = '';
    py.stdout.on('data', (d) => data += d.toString());
    py.stderr.on('data', (d) => error += d.toString());
    py.on('close', (code) => {
      if (code !== 0) reject(error);
      else resolve(data);
    });
  });
};

// --- AI Agents ---

// 1. Lab Report Interpreter (Hybrid OCR + LLM)
app.post('/api/analyze-lab-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const { isDoctor } = req.body;
    const audience = isDoctor === 'true' ? "a medical doctor using clinical terminology" : "a patient using simple, easy to understand language";

    console.log(`Extracting text from lab report: ${req.file.path}`);
    
    // Step 1: Run OCR
    let ocrResult;
    try {
      const rawOcr = await runPython('lab_bridge.py', [req.file.path]);
      ocrResult = JSON.parse(rawOcr);
    } catch (e) {
      console.error("OCR Error:", e);
      return res.status(500).json({ error: 'OCR Extraction failed' });
    }

    if (ocrResult.error) return res.status(500).json({ error: ocrResult.error });

    // Step 2: Pass text to Groq 70B for interpretation
    const prompt = `
      You are an expert AI medical assistant. Interpret the following extracted lab report text for ${audience}.
      
      EXTRACTED TEXT:
      """
      ${ocrResult.text}
      """

      Analyze the values. Identify any results outside normal reference ranges.
      
      Format your response exactly as:
      SUMMARY: [concise clinical summary]
      ISSUES: [issue1 | issue2 | issue3]
      RISK: [Low/Medium/High]
      RECOMMENDATIONS: [rec1 | rec2]
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const response = completion.choices[0].message.content;
    
    const parsed = {
      summary: "Analysis generated.",
      detected_issues: [],
      risk_level: "Unknown",
      recommendations: []
    };

    response.split('\n').forEach(line => {
      line = line.trim();
      if (line.startsWith("SUMMARY:")) parsed.summary = line.replace("SUMMARY:", "").trim();
      else if (line.startsWith("ISSUES:")) {
        const issuesRaw = line.replace("ISSUES:", "").trim();
        parsed.detected_issues = issuesRaw.split('|').map(i => i.trim()).filter(i => i);
      }
      else if (line.startsWith("RISK:")) parsed.risk_level = line.replace("RISK:", "").trim();
      else if (line.startsWith("RECOMMENDATIONS:")) {
        const recsRaw = line.replace("RECOMMENDATIONS:", "").trim();
        parsed.recommendations = recsRaw.split('|').map(r => r.trim()).filter(r => r);
      }
    });

    res.json(parsed);
  } catch (error) {
    console.error("Lab Analysis Error:", error);
    res.status(500).json({ error: 'Failed to interpret lab report' });
  }
});

// 2. MedAdvisor Egypt
app.post('/api/medadvisor', async (req, res) => {
  try {
    const { query, conditions, isPharmacist } = req.body;
    
    let pharmacistDetail = "";
    if (isPharmacist) {
      pharmacistDetail = `
        - Include EDA (Egyptian Drug Authority) registration hints if possible.
        - Provide SPECIFIC DOSAGE based on standard Egyptian clinical guidelines.
        - Mention manufacturer names (e.g., Eva Pharma, Amoun, Sedico, Memphis).
        - Use higher-level clinical terminology.
      `;
    }

    const systemPrompt = `
      You are MedAdvisor Egypt — an intelligent pharmaceutical DSS specialized in the Egyptian drug market.
      
      Your goal is to suggest medically equivalent local alternatives available in Egypt, especially during shortages of imported brands.

      Capabilities & Constraints:
      1. EGYPTIAN MARKET: Only suggest medications that are actively registered and available in Egypt.
      2. DOSAGE: You MUST provide the correct standard dosage for each medication suggested.
      3. SUBSTITUTES: Rank by: 
         - Same active ingredient (Generic)
         - Same therapeutic class
         - Local Egyptian manufacturers (Amoun, Eva, etc.)
      4. SAFETY: Flag contraindications for these conditions: ${conditions}.
      5. ${pharmacistDetail}

      You MUST return your response in a valid JSON format with the following structure:
      {
          "medication_searched": "name",
          "shortage_status": "status",
          "substitutes": [
              {
                  "name": "drug name",
                  "reason": "why it is recommended",
                  "manufacturer": "company name",
                  "active_ingredient": "ingredients",
                  "dosage": "specific dosage instructions"
              }
          ],
          "doctor_review_required": "Yes ⚠️ / No",
          "notes": ["note 1", "note 2"],
          "disclaimer": "This advice does not replace a doctor's prescription."
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Medication Query: ${query}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error("MedAdvisor Error:", error);
    res.status(500).json({ error: 'Failed to get medical advice' });
  }
});

// 3. X-Ray Analysis (Bridge to Python)
app.post('/api/analyze-xray', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  console.log(`Analyzing X-ray: ${req.file.path}`);
  
  try {
    const dataString = await runPython('yolo_bridge.py', [req.file.path]);
    
    const jsonStart = dataString.indexOf('{');
    const jsonEnd = dataString.lastIndexOf('}') + 1;
    const cleanJson = dataString.substring(jsonStart, jsonEnd);
    
    const results = JSON.parse(cleanJson);
    if (results.error) return res.status(500).json({ error: results.error });

    if (results.annotated_image_path) {
      results.annotated_image_url = `http://localhost:${port}/uploads/${path.basename(results.annotated_image_path)}`;
    }
    res.json(results);
  } catch (errorString) {
    console.error(`X-Ray Error: ${errorString}`);
    res.status(500).json({ error: `Analysis script failed: ${errorString}` });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
