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

// 1. Lab Report Interpreter (Enhanced Clinical Assessment)
app.post('/api/analyze-lab-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const { isDoctor } = req.body;
    const audience = isDoctor === 'true' ? "a medical professional using high-level clinical pathology terms" : "a patient using clear, empathetic, and simple language";

    let ocrResult;
    try {
      const rawOcr = await runPython('lab_bridge.py', [req.file.path]);
      ocrResult = JSON.parse(rawOcr);
    } catch (e) {
      return res.status(500).json({ error: 'OCR Extraction failed' });
    }

    const prompt = `
      You are a Senior Clinical Pathologist. Analyze this extracted lab data for ${audience}.
      
      EXTRACTED TEXT:
      """
      ${ocrResult.text}
      """

      Provide a deep clinical assessment. For each abnormal value:
      1. Explain WHY it might be high/low (Pathophysiology).
      2. Mention clinical correlations (e.g., if glucose is high, mention A1C or hydration).
      3. Suggest specific follow-up tests or lifestyle changes.

      Format exactly as:
      SUMMARY: [detailed clinical assessment and explanation]
      ISSUES: [issue1 | issue2 | issue3]
      RISK: [Low/Medium/High]
      RECOMMENDATIONS: [rec1 | rec2 | rec3]
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const response = completion.choices[0].message.content;
    const parsed = { summary: "", detected_issues: [], risk_level: "Unknown", recommendations: [] };
    response.split('\n').forEach(line => {
      line = line.trim();
      if (line.startsWith("SUMMARY:")) parsed.summary = line.replace("SUMMARY:", "").trim();
      else if (line.startsWith("ISSUES:")) {
        parsed.detected_issues = line.replace("ISSUES:", "").trim().split('|').map(i => i.trim()).filter(i => i);
      }
      else if (line.startsWith("RISK:")) parsed.risk_level = line.replace("RISK:", "").trim();
      else if (line.startsWith("RECOMMENDATIONS:")) {
        parsed.recommendations = line.replace("RECOMMENDATIONS:", "").trim().split('|').map(r => r.trim()).filter(r => r);
      }
    });
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to interpret lab report' });
  }
});

// 2. MedAdvisor Egypt
app.post('/api/medadvisor', async (req, res) => {
  try {
    const { query, conditions, isPharmacist } = req.body;
    let pharmacistDetail = isPharmacist ? "- Include EDA registration hints. - Provide SPECIFIC DOSAGE. - Mention manufacturers (Amoun, Eva, etc)." : "";
    const systemPrompt = `You are MedAdvisor Egypt specialized in Egyptian drugs. Query: ${query}. Conditions: ${conditions}. ${pharmacistDetail} Return JSON.`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: query }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });
    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) { res.status(500).json({ error: 'Failed to get advice' }); }
});

// 3. X-Ray Analysis (Interactive Table + LLM Interpretation)
app.post('/api/analyze-xray', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const rawData = await runPython('yolo_bridge.py', [req.file.path]);
    const yoloResults = JSON.parse(rawData);
    if (yoloResults.error) return res.status(500).json({ error: yoloResults.error });

    // Enrich with LLM
    const detections = yoloResults.detections || [];
    const classes = detections.map(d => d.class).join(', ');
    
    const prompt = `
      You are a Radiologist. We detected these findings on a chest X-ray: [${classes || 'No abnormalities'}].
      
      For each finding, provide:
      1. A short clinical brief (1 sentence).
      2. A general summary interpretation of the whole scan.
      
      If no abnormalities were found, explain that the cardiac silhouette and lung fields appear within normal limits.

      Return JSON format:
      {
        "briefs": {"FindingName": "Short brief..."},
        "summary": "Full interpretation...",
        "risk_level": "Low/Medium/High"
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const llmEnrichment = JSON.parse(completion.choices[0].message.content);
    
    // Merge results
    const finalDetections = detections.map(d => ({
      ...d,
      brief: llmEnrichment.briefs[d.class] || "Clinical observation requiring review."
    }));

    res.json({
      detections: finalDetections,
      summary: llmEnrichment.summary,
      risk_level: llmEnrichment.risk_level || (finalDetections.length > 0 ? "High" : "Low"),
      confidence_score: yoloResults.max_confidence || (finalDetections.length === 0 ? 99.0 : 0),
      annotated_image_url: `http://localhost:${port}/uploads/${path.basename(yoloResults.annotated_image_path)}`,
      system_status: "Neural Engine + LLM Reasoning Active"
    });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
