import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css'; // 

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export default function App() {
  const [viewMode, setViewMode] = useState('portal');
  const [isUploading, setIsUploading] = useState(false);
  const [projectHistory, setProjectHistory] = useState([
    { id: 'p1', title: 'MIDNIGHT RISES', date: '2026-04-15', shots: [] }
  ]);
  const [data, setData] = useState({ projectTitle: "", shots: [], activeShotId: null });

  const activeShot = data.shots.find(s => s.id === data.activeShotId) || null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extracted = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map(item => item.str).join(" ");
        const pattern = /(?:Shot|Scene|Sc)?\s*\b(\d?[A-Z\d]+)\b\s*(.*?)(?=(?:Shot|Scene|Sc)?\s*\b\d[A-Z\d]\b|$)/gi;
        let m;
        while ((m = pattern.exec(text)) !== null) {
          if (m[2].length > 5) extracted.push({ id: Math.random(), shotNum: m[1], status: "ready", desc: m[2].trim() });
        }
      }
      const newP = { id: Date.now(), title: file.name.replace('.pdf', '').toUpperCase(), date: '2026-04-20', shots: extracted };
      setProjectHistory([newP, ...projectHistory]);
      setData({ projectTitle: newP.title, shots: extracted, activeShotId: extracted[0]?.id });
      setViewMode('dashboard');
    } catch (err) { alert("Parsing Error"); } finally { setIsUploading(false); }
  };

  if (viewMode === 'portal') return (
    <div className="portal-root">
      <div className="portal-container">
        <h1 className="portal-logo">SHOT FLOW</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <section>
            <h3 className="panel-header" style={{background:'none', padding:'0 0 12px 0'}}>Project Archive</h3>
            {projectHistory.map(p => (
              <div key={p.id} className="history-card" onClick={() => { setData({projectTitle: p.title, shots: p.shots, activeShotId: p.shots[0]?.id}); setViewMode('dashboard'); }}>
                <div>
                  <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{p.date}</div>
                  <div style={{fontWeight:'700'}}>{p.title}</div>
                  <div style={{fontSize:'12px', color:'var(--primary)', marginTop:'4px'}}>{p.shots.length} shots recorded</div>
                </div>
                <button className="btn-outline" style={{borderColor:'#7f1d1d', color:'#ef4444', fontSize:'11px'}} onClick={(e) => { e.stopPropagation(); setProjectHistory(projectHistory.filter(x => x.id !== p.id)) }}>Remove</button>
              </div>
            ))}
          </section>
          <section>
            <h3 className="panel-header" style={{background:'none', padding:'0 0 12px 0'}}>Import Data</h3>
            <div className="upload-box">
              <input type="file" accept=".pdf" onChange={handleFileUpload} style={{position:'absolute', opacity:0, width:'100%', height:'100%', cursor:'pointer', left:0, top:0}} />
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
              <p style={{ fontWeight: '600', margin: '0' }}>{isUploading ? "Processing..." : "Drop Shot List PDF"}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to browse or drag and drop</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-root">
      <header className="header">
        <button className="btn-outline" onClick={() => setViewMode('portal')}>← Portal</button>
        <div style={{ fontWeight: '700', letterSpacing: '1px' }}>{data.projectTitle}</div>
        <div style={{ width: '80px' }}></div>
      </header>
      <main className="main-layout">
        <div className="panel">
          <div className="panel-header">Shot List</div>
          <div className="panel-content" style={{padding:0}}>
            {data.shots.map(s => (
              <div key={s.id} className={`shot-item ${data.activeShotId === s.id ? 'active' : ''}`} onClick={() => setData({ ...data, activeShotId: s.id })}>
                <span className={`status-tag ${s.status}`}>{s.status}</span>
                <div style={{ fontWeight: '600', marginTop: '8px' }}>Shot {s.shotNum}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Technical Details</div>
          <div className="panel-content">
            {activeShot ? (
              <>
                <h1 style={{ marginTop: 0 }}>Shot {activeShot.shotNum}</h1>
                <p style={{ lineHeight: '1.8', fontSize: '15px', color: '#cbd5e1' }}>{activeShot.desc}</p>
              </>
            ) : "No shot selected"}
          </div>
        </div>
        <div className="panel">
          <div className="panel-header">Actions</div>
          <div className="panel-content">
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setData({...data, shots: data.shots.map(s => s.id === data.activeShotId ? {...s, status: 'wrapped'} : s)})}>Mark Wrapped</button>
          </div>
        </div>
      </main>
    </div>
  );
}