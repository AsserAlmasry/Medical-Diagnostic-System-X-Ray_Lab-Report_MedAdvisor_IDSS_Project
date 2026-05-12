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
  AlertCircle,
  Database,
  Cpu,
  Layers,
  Globe,
  ShieldCheck,
  Zap,
  FolderHeart,
  History,
  User,
  Microscope,
  Stethoscope as StethIcon
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
         <h1>Chest X-ray AI Analysis 🩻</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>High-precision anomaly detection using YOLO12 Neural Network. 🚀</p>
      
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
            <h3>Click to Upload X-ray Image 📁</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '10px' }}>Supports PNG, JPG, JPEG</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <img src={result?.annotated_image_url || preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '15px', border: '1px solid var(--glass-border)' }} />
            {result?.annotated_image_url && (
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,242,255,0.9)', color: '#000', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                YOLO12 Detections 🎯
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                <Zap size={20} /> {loading ? "Analyzing..." : "Run Analysis ⚡"}
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => setFile(null)}>
                <RotateCcw size={20} /> Reset
              </button>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="result-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className={`risk-badge risk-${result.risk_level?.toLowerCase() || 'low'}`}>
                 {result.risk_level === 'High' ? '🚨' : result.risk_level === 'Medium' ? '⚠️' : '✅'} {result.risk_level || 'Low'} Risk Level
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  Confidence: <span style={{ color: 'var(--primary)' }}>{result.confidence_score}%</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(0,242,255,0.6)', marginTop: '5px' }}>● Neural Engine + LLM Reasoning Active</div>
              </div>
            </div>

            {/* Detections Table */}
            {result.detections && result.detections.length > 0 && (
              <div style={{ marginBottom: '25px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)' }}>
                      <th style={{ textAlign: 'left', padding: '10px' }}>🔍 Clinical Finding</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>📝 Brief Description</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>🎯 Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.detections.map((det, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{det.class}</td>
                        <td style={{ padding: '12px', opacity: 0.8 }}>{det.brief}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--primary)', fontWeight: 'bold' }}>{det.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ padding: '25px', background: 'rgba(0, 242, 255, 0.03)', borderRadius: '15px', borderLeft: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                 <StethIcon size={80} color="var(--primary)" />
              </div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Agent Summary Interpretation 🤖
              </h4>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.7', opacity: 0.9, color: '#fff' }}>{result.summary}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const LabReportView = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDoctor, setIsDoctor] = useState(false);

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
      const data = await analyzeLabReport(file, isDoctor);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.response?.data?.error || "Failed to interpret report"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <FileText size={32} color="var(--primary)" />
           <h1>Lab Report Interpreter 🔬</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '8px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
           <input type="checkbox" id="doctor-mode" checked={isDoctor} onChange={() => setIsDoctor(!isDoctor)} />
           <label htmlFor="doctor-mode" style={{ cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Doctor-Level Mode 🩺</label>
        </div>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>AI-driven clinical assessment of hematology & chemistry results. 📊</p>

      <div className="card">
        {!preview ? (
          <div className="upload-zone" onClick={() => document.getElementById('lab-upload').click()}>
            <input type="file" id="lab-upload" hidden onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
            <Upload size={48} color="#00f2ff" style={{ marginBottom: '20px' }} />
            <h3>Upload Lab Result Image 📄</h3>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '15px', border: '1px solid var(--glass-border)' }} />
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                <Layers size={20} /> {loading ? "Interpreting..." : "Start Interpretation ⚡"}
              </button>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }} onClick={() => setFile(null)}>
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '40px' }}>
            <div className={`risk-badge risk-${result.risk_level?.toLowerCase() || 'low'}`} style={{ marginBottom: '20px' }}>
               {result.risk_level === 'High' ? '🚨' : result.risk_level === 'Medium' ? '⚠️' : '✅'} {result.risk_level} Risk Level
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '30px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ color: 'var(--primary)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Microscope size={20} /> Clinical Summary & Pathophysiology
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '15px' }}>{result.summary}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                <div>
                  <h4 style={{ color: '#ff5e00', marginBottom: '15px' }}>⚠️ Detected Abnormalities</h4>
                  <ul style={{ paddingLeft: '15px' }}>
                    {result.detected_issues.map((issue, i) => <li key={i} style={{ marginBottom: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{issue}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>💡 Recommendations</h4>
                  <ul style={{ paddingLeft: '15px' }}>
                    {result.recommendations.map((rec, i) => <li key={i} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '10px', fontSize: '14px' }}>{rec}</li>)}
                  </ul>
                </div>
              </div>
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

  const [showReasoning, setShowReasoning] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResult(null);
    setShowReasoning(false);
    try {
      const data = await getMedAdvisorAdvice(query, conditions, isPharmacist);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("System Overload or Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         <Pill size={32} color="var(--primary)" />
         <h1>MedAdvisor Egypt 💊</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Neuro-Symbolic expert system for drug shortage & clinical alternatives. 🇪🇬</p>

      <div className="card">
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 2 }}>
            <label className="nav-label">Drug Search 🔍</label>
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
               <label htmlFor="pharmacist" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Pharmacist Mode 👨‍⚕️</label>
            </div>
          </div>
        </div>
        <label className="nav-label">Patient Clinical Context (Optional) 🩺</label>
        <textarea 
          className="mode-selector" 
          style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', minHeight: '80px', marginBottom: '25px' }}
          placeholder="e.g., Hypertension, Pregnancy, G6PD deficiency..."
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
        <button className="btn-primary" onClick={handleSearch} disabled={loading || !query}>
          <ShieldCheck size={20} /> {loading ? "Consulting Knowledge Base..." : "Check Substitutes & Dosage 🚀"}
        </button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
               <div style={{ flex: 1, padding: '15px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '15px', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '5px' }}>
                    <Cpu size={16} /> <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Expert Model (Symbolic)</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>SCRE v2.1</div>
               </div>
               <div style={{ flex: 1, padding: '15px', background: 'rgba(125, 0, 255, 0.05)', borderRadius: '15px', border: '1px solid rgba(125, 0, 255, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)', marginBottom: '5px' }}>
                    <Database size={16} /> <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Knowledge Base (Neo4j)</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>Egyptian Registry (5,000+)</div>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
              <p><strong>Target Drug:</strong> <span style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: 'bold' }}>{result?.medication_searched || 'N/A'}</span></p>
              <p><strong>Doctor Review:</strong> <span style={{ color: result?.doctor_review_required?.includes('Yes') ? '#ff0055' : 'var(--primary)', fontWeight: 'bold' }}>{result?.doctor_review_required || 'No'}</span></p>
            </div>
            
            <h3 style={{ marginBottom: '20px' }}>🇪🇬 Recommended Substitutes (Egyptian Market)</h3>
            <div className="med-grid">
              {result.substitutes && result.substitutes.map((sub, i) => (
                <div key={i} className="med-card">
                   <div style={{ background: 'rgba(0,242,255,0.1)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                      <Pill size={24} color="var(--primary)" />
                   </div>
                   <h4 style={{ color: '#fff', fontSize: '18px' }}>{sub.name}</h4>
                   <p style={{ fontSize: '11px', color: 'var(--primary)', margin: '8px 0', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>{sub.manufacturer}</p>
                   <div style={{ margin: '15px 0', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <strong style={{ color: 'var(--primary)' }}>Dosage:</strong> {sub.dosage || "Consult Pharmacist"}
                   </div>
                   <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>{sub.reason}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '30px', padding: '30px', background: 'linear-gradient(135deg, rgba(0,242,255,0.1), rgba(112,0,255,0.1))', borderRadius: '25px', border: '1px solid rgba(0,242,255,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                 <Zap size={24} color="var(--primary)" />
                 <h3 style={{ color: '#fff', margin: 0 }}>Final Expert Advice ✨</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.8' }}>{result.notes && result.notes[0]}</p>
              <button className="btn-primary" style={{ marginTop: '20px', width: 'auto' }} onClick={() => setShowReasoning(!showReasoning)}>
                 <History size={18} /> {showReasoning ? "Hide Reasoning" : "View Clinical Reasoning Path"}
              </button>

              <AnimatePresence>
                {showReasoning && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: '20px', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '20px', border: '1px solid var(--glass-border)', display: 'grid', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,242,255,0.05)', padding: '15px', borderRadius: '15px', borderLeft: '4px solid var(--primary)' }}>
                        <Database size={24} color="var(--primary)" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>STEP 1: KNOWLEDGE GRAPH QUERY</div>
                          <div style={{ fontSize: '14px', color: '#fff', marginTop: '5px' }}>Queried Neo4j for <strong>{result?.medication_searched}</strong>. Match Status: {result?.shortage_status}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(112,0,255,0.05)', padding: '15px', borderRadius: '15px', borderLeft: '4px solid var(--secondary)' }}>
                        <Layers size={24} color="var(--secondary)" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--secondary)' }}>STEP 2: SYMBOLIC FILTERING (SCRE)</div>
                          <div style={{ fontSize: '14px', color: '#fff', marginTop: '5px' }}>Retrieved substitutes via <em>'BELONGS_TO'</em> category, filtered by Egyptian Market manufacturers.</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,255,170,0.05)', padding: '15px', borderRadius: '15px', borderLeft: '4px solid var(--success)' }}>
                        <Cpu size={24} color="var(--success)" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--success)' }}>STEP 3: NEURAL INTERPRETATION</div>
                          <div style={{ fontSize: '14px', color: '#fff', marginTop: '5px' }}>Llama-3.3-70B activated to formulate clinical advice and verify safety constraints.</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const PatientRecordsView = () => {
  const [records, setRecords] = useState([
    { id: 1, date: '2026-05-10', type: 'X-Ray Analysis', summary: 'Mild Pneumonia detected in lower left lobe. Follow-up CT recommended.', status: '🚨 High Priority' },
    { id: 2, date: '2026-05-08', type: 'Lab Interpretation', summary: 'Microcytic anemia patterns identified. Iron panel requested.', status: '⚠️ In Review' },
    { id: 3, date: '2026-05-05', type: 'MedAdvisor Query', summary: 'Substitute for Euthyrox 50mcg found: Thyroxin (Eva Pharma).', status: '✅ Completed' }
  ]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         <FolderHeart size={32} color="var(--primary)" />
         <h1>Patient Medical Records 📂</h1>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>Secure, AI-indexed history of clinical encounters and prescriptions. 🔐</p>

      <div className="card">
        <div style={{ display: 'grid', gap: '20px' }}>
          {records.map(rec => (
            <div key={rec.id} className="med-card" style={{ display: 'flex', textAlign: 'left', alignItems: 'flex-start', gap: '20px', padding: '30px', cursor: 'pointer' }} onClick={() => alert(`Opening detailed view for ${rec.type}...`)}>
              <div style={{ background: 'rgba(0,242,255,0.1)', padding: '15px', borderRadius: '15px' }}>
                 <FileText size={24} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold' }}>{rec.date} • {rec.type}</span>
                  <span style={{ fontSize: '12px', color: '#fff', opacity: 0.8 }}>{rec.status}</span>
                </div>
                <div style={{ fontSize: '16px', color: '#fff', fontWeight: '500', lineHeight: '1.5' }}>{rec.summary}</div>
              </div>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ marginTop: '30px' }} onClick={() => alert('Feature coming soon: Integration with Electronic Health Records (EHR) System.')}>
           <User size={18} /> View Patient Profile Details
        </button>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>System Intelligent Dashboard 📊</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>MedAI Insight v2.2 - Multi-Modal Neuro-Symbolic Suite 🚀</p>
      
      <div className="med-grid">
        <div className="med-card" style={{ background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.05), transparent)' }}>
          <Activity size={32} color="var(--primary)" />
          <h3 style={{ marginTop: '15px' }}>Neural Engine 🧠</h3>
          <p style={{ fontSize: '13px', marginTop: '10px', color: 'rgba(255,255,255,0.5)' }}>YOLO12 & Llama 3.3 Active</p>
        </div>
        <div className="med-card" style={{ background: 'linear-gradient(135deg, rgba(125, 0, 255, 0.05), transparent)' }}>
          <Database size={32} color="var(--secondary)" />
          <h3 style={{ marginTop: '15px' }}>Symbolic Base 🏛️</h3>
          <p style={{ fontSize: '13px', marginTop: '10px', color: 'rgba(255,255,255,0.5)' }}>Neo4j Graph - 5,000+ Nodes</p>
        </div>
        <div className="med-card" style={{ background: 'linear-gradient(135deg, rgba(255, 94, 0, 0.05), transparent)' }}>
          <ShieldCheck size={32} color="var(--accent)" />
          <h3 style={{ marginTop: '15px' }}>Expert Layer 🛡️</h3>
          <p style={{ fontSize: '13px', marginTop: '10px', color: 'rgba(255,255,255,0.5)' }}>SCRE Logic Enabled</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px', textAlign: 'center' }}>
         <h2 style={{ marginBottom: '20px' }}>Welcome to the Future of Egyptian Healthcare 🇪🇬</h2>
         <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
           Our Neuro-Symbolic Intelligent Decision Support System combines deep learning with medical expert systems 
           to provide reliable, localized diagnostic support. Explore the modules from the sidebar to begin.
         </p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeMode, setActiveMode] = useState('dashboard');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <StethIcon size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0 }}>MEDAI INSIGHT</h2>
          </div>
          <p style={{ fontSize: '12px', opacity: 0.6 }}>Intelligent Decision Support ⚡</p>
        </div>

        <div className="nav-section">
          <label className="nav-label">Core Capabilities 🚀</label>
          <select 
            className="mode-selector" 
            value={activeMode}
            onChange={(e) => setActiveMode(e.target.value)}
          >
            <option value="dashboard">🏠 System Dashboard</option>
            <option value="xray">🩻 X-ray Analysis AI</option>
            <option value="lab">🔬 Lab Interpreter</option>
            <option value="medadvisor">💊 MedAdvisor Egypt</option>
            <option value="records">📂 Patient Records</option>
          </select>
        </div>

        <div className="settings-section">
          <div style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--glass-border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', marginBottom: '5px' }}>
               <Globe size={14} /> <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>System Status 🌐</span>
             </div>
             <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>● Production Ready (v2.2)</div>
          </div>
        </div>
        
        <footer style={{ marginTop: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: '1px' }}>
          PROPRIETARY IDSS • 2026 🇪🇬
        </footer>
      </aside>

      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeMode === 'dashboard' && <Dashboard key="dashboard" />}
          {activeMode === 'xray' && <XRayView key="xray" />}
          {activeMode === 'lab' && <LabReportView key="lab" />}
          {activeMode === 'medadvisor' && <MedAdvisorView key="medadvisor" />}
          {activeMode === 'records' && <PatientRecordsView key="records" />}
        </AnimatePresence>
      </main>
    </div>
  );
}
