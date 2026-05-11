import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Pill, 
  LayoutDashboard, 
  ChevronRight,
  Upload, 
  FileText,
  Camera,
  RotateCcw,
  Activity,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLabReport, getMedAdvisorAdvice, analyzeXRay } from './api';

// --- Sub-components ---

const XRayView = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeXRay(file);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.error || "Failed to analyze X-ray"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         <Camera size={32} color="var(--primary)" />
         <h1>Chest X-ray AI Analysis</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>High-precision anomaly detection using YOLO12 Neural Network.</p>
      
      <div className="card">
        {!preview ? (
          <div className="upload-zone" onClick={() => document.getElementById('xray-upload').click()}>
            <input 
              type="file" 
              id="xray-upload" 
              hidden 
              onChange={(e) => setFile(e.target.files[0])} 
              accept="image/*"
            />
            <Upload size={48} color="#00f2ff" style={{ marginBottom: '20px' }} />
            <h3>Click to Upload X-ray Image</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>Supports PNG, JPG, JPEG</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '15px', border: '1px solid var(--glass-border)' }} />
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                {loading ? "Analyzing..." : "Run Analysis"}
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => setFile(null)}>
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className={`risk-badge risk-${result.risk_level?.toLowerCase() || 'low'}`}>
                {result.risk_level || 'Low'} Risk Level
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Confidence: <span style={{ color: 'var(--primary)' }}>{result.confidence_score}%</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(0,242,255,0.6)', marginTop: '5px' }}>● {result.system_status}</div>
              </div>
            </div>

            {/* Detections Table */}
            {result.detections && result.detections.length > 0 && (
              <div style={{ marginBottom: '25px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)' }}>
                      <th style={{ textAlign: 'left', padding: '10px' }}>Clinical Finding</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>Brief Description</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detections.map((det, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{det.class}</td>
                        <td style={{ padding: '12px', opacity: 0.8 }}>{det.brief}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--primary)' }}>{det.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} /> Clinical Interpretation
              </h4>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>{result.summary}</p>
            </div>
            
            {result.annotated_image_url && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Neural Heatmap & Detection</h3>
                <img src={result.annotated_image_url} alt="Annotated" style={{ width: '100%', borderRadius: '15px', border: '1px solid var(--primary)', boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)' }} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const LabView = ({ isDoctor }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('isDoctor', isDoctor);
      
      const response = await fetch('http://localhost:5000/api/analyze-lab-image', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing lab report image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         <FileText size={32} color="var(--primary)" />
         <h1>Lab Report Smart Interpreter</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Upload your lab test image for AI extraction and clinical reasoning.</p>
      
      <div className="card">
        {!preview ? (
          <div className="upload-zone" onClick={() => document.getElementById('lab-upload').click()}>
            <input 
              type="file" 
              id="lab-upload" 
              hidden 
              onChange={(e) => setFile(e.target.files[0])} 
              accept="image/*"
            />
            <Upload size={48} color="#00f2ff" style={{ marginBottom: '20px' }} />
            <h3>Upload Lab Report Image</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>Scan or Take a Photo of your results</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '15px', border: '1px solid var(--glass-border)' }} />
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="btn-primary" onClick={handleAnalyze} disabled={loading}>
                {loading ? "Interpreting..." : "Interpret Results"}
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => setFile(null)}>
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '40px' }}>
            <div className={`risk-badge risk-${result.risk_level?.toLowerCase() || 'low'}`}>
              {result.risk_level} Risk
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ color: 'var(--primary)' }}>Clinical Summary</h3>
              <p style={{ marginTop: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>{result.summary}</p>
              
              <h3 style={{ marginTop: '25px' }}>Detected Abnormalities</h3>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                {result.detected_issues.map((issue, i) => <li key={i} style={{ marginBottom: '8px', color: '#ff5e00' }}>{issue}</li>)}
              </ul>

              <h3 style={{ marginTop: '25px' }}>Smart Recommendations</h3>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                {result.recommendations.map((rec, i) => <li key={i} style={{ color: 'var(--primary)', marginBottom: '8px' }}>{rec}</li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const MedAdvisorView = () => {
  const [query, setQuery] = useState('');
  const [conditions, setConditions] = useState('');
  const [isPharmacist, setIsPharmacist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getMedAdvisorAdvice(query, conditions, isPharmacist);
      setResult(data);
    } catch (err) {
      alert("Error getting pharmaceutical advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         <Pill size={32} color="var(--primary)" />
         <h1>MedAdvisor Egypt</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Intelligent drug decision support for the Egyptian pharmaceutical market.</p>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
          <div style={{ flex: 2 }}>
            <label className="nav-label">Medication Name (Brand or Generic)</label>
            <input 
              type="text" 
              className="mode-selector" 
              style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }} 
              placeholder="e.g., Euthyrox, Panadol, Congestal" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,242,255,0.05)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(0,242,255,0.1)' }}>
               <input type="checkbox" id="pharmacist" checked={isPharmacist} onChange={() => setIsPharmacist(!isPharmacist)} />
               <label htmlFor="pharmacist" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Pharmacist Mode</label>
            </div>
          </div>
        </div>
        <label className="nav-label">Patient Clinical Context (Optional)</label>
        <textarea 
          className="mode-selector" 
          style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', minHeight: '80px', marginBottom: '25px' }}
          placeholder="e.g., Hypertension, Pregnancy, G6PD deficiency..."
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={loading || !query}>
          {loading ? "Consulting AI Database..." : "Check Substitutes & Dosage"}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
              <p><strong>Target:</strong> <span style={{ color: 'var(--primary)', fontSize: '18px' }}>{result.medication_searched}</span></p>
              <p><strong>Review Needed:</strong> <span style={{ color: result.doctor_review_required.includes('Yes') ? '#ff0055' : 'var(--primary)' }}>{result.doctor_review_required}</span></p>
            </div>
            
            <h3 style={{ marginBottom: '20px' }}>🇪🇬 Recommended Substitutes (Egyptian Market)</h3>
            <div className="med-grid">
              {result.substitutes && result.substitutes.map((sub, i) => (
                <div key={i} className="med-card">
                   <div style={{ background: 'rgba(0,242,255,0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                      <Pill size={24} color="var(--primary)" />
                   </div>
                   <h4 style={{ color: '#fff', fontSize: '18px' }}>{sub.name}</h4>
                   <p style={{ fontSize: '11px', color: 'var(--primary)', margin: '8px 0', fontWeight: '800', letterSpacing: '1px' }}>{sub.manufacturer}</p>
                   <div style={{ margin: '15px 0', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '13px' }}>
                      <strong style={{ color: 'var(--primary)' }}>Dosage:</strong> {sub.dosage || "Consult Pharmacist"}
                   </div>
                   <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{sub.reason}</p>
                </div>
              ))}
            </div>
            {result.notes && result.notes.length > 0 && (
              <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(0,242,255,0.05)', borderRadius: '20px', border: '1px solid rgba(0,242,255,0.1)' }}>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                  <AlertCircle size={20} /> Clinical & Shortage Notes:
                </p>
                <ul style={{ marginLeft: '25px' }}>
                  {result.notes.map((note, i) => <li key={i} style={{ marginBottom: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{note}</li>)}
                </ul>
              </div>
            )}
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ 
                  background: 'linear-gradient(135deg, #ff0055 0%, #ff5e00 100%)', 
                  fontSize: '12px', 
                  padding: '15px 30px', 
                  borderRadius: '30px',
                  boxShadow: '0 10px 20px rgba(255, 0, 85, 0.2)',
                  cursor: 'default'
                }}
              >
                ⚠️ {result.disclaimer}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const PatientSummaryView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
       <LayoutDashboard size={32} color="var(--primary)" />
       <h1>Neural Patient Profile</h1>
    </div>
    <div className="card" style={{ textAlign: 'center', borderStyle: 'dashed', borderColor: 'var(--primary)', padding: '80px 40px' }}>
       <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>🔒 Data Synchronization in Progress</h2>
       <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Our neural engine is preparing to aggregate your longitudinal health data into a unified, AI-driven timeline.</p>
       <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
          <div style={{ padding: '15px 30px', background: 'rgba(0,242,255,0.1)', borderRadius: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>Imaging History</div>
          <div style={{ padding: '15px 30px', background: 'rgba(112,0,255,0.1)', borderRadius: '15px', color: 'var(--secondary)', fontWeight: 'bold' }}>Lab Trends</div>
          <div style={{ padding: '15px 30px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', fontWeight: 'bold' }}>Genomic Sync</div>
       </div>
    </div>
  </motion.div>
);

function App() {
  const [mode, setMode] = useState('xray');
  const [isDoctor, setIsDoctor] = useState(false);

  const renderContent = () => {
    switch(mode) {
      case 'xray': return <XRayView />;
      case 'lab': return <LabView isDoctor={isDoctor} />;
      case 'med': return <MedAdvisorView />;
      case 'summary': return <PatientSummaryView />;
      default: return <XRayView />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Stethoscope color="#00f2ff" size={32} />
            <h2 style={{ letterSpacing: '1px', textTransform: 'uppercase', fontSize: '20px' }}>MedAI Insight</h2>
          </div>
          <p>Next-Gen Diagnostic Suite</p>
        </div>

        <nav className="nav-section">
          <label className="nav-label">Choose Mode</label>
          <div style={{ position: 'relative' }}>
            <select 
              className="mode-selector" 
              value={mode} 
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="xray">🩻 X-ray Analysis</option>
              <option value="lab">🧪 Lab Report Interpreter</option>
              <option value="med">💊 MedAdvisor Egypt (Pharmacy)</option>
              <option value="summary">📊 Patient Summary</option>
            </select>
            <ChevronRight size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%) rotate(90deg)', pointerEvents: 'none', color: 'var(--primary)' }} />
          </div>
        </nav>

        <div className="settings-section">
           <label className="nav-label">Preferences</label>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '15px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
              <input 
                type="checkbox" 
                checked={isDoctor} 
                onChange={() => setIsDoctor(!isDoctor)}
                id="doctor-toggle"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="doctor-toggle" style={{ cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Doctor-Level Mode</label>
           </div>
           
           <div style={{ marginTop: '35px' }}>
             <label className="nav-label" style={{ fontSize: '10px' }}>AI Intelligence Core</label>
             <div style={{ background: 'rgba(0,242,255,0.08)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(0,242,255,0.2)' }}>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} /> Groq LP
                </p>
                <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>Llama 3.3 70B Versatile</p>
             </div>
           </div>
        </div>
        
        <div style={{ marginTop: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
          PROPRIETARY IDSS • v2.2.0
        </div>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        
        <footer style={{ marginTop: '100px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
          PROPRIETARY AI SYSTEM • FOR DEMONSTRATION ONLY • NOT MEDICAL ADVICE • © 2026
        </footer>
      </main>
    </div>
  );
}

export default App;
