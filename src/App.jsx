import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { auth } from './firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import './App.css'; 

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const CATEGORIES = {
  EQUIPMENT: "Equipment",
  MOVEMENT: "Movement",
  ANGLE: "Shot Angle",
  SIZE: "Shot Size",
  LENS: "Lens",
  APERTURE: "Aperture",
  TIME: "Time Est.",
  DESCRIPTION: "Description",
  LIGHTING: "Lighting",
  REFERENCE: "Reference",
  NOTES: "Notes",
  DIRECTOR: "Director Notes"
};

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- APP STATE ---
  const [viewMode, setViewMode] = useState('portal');
  const [isUploading, setIsUploading] = useState(false);
  const [projectHistory, setProjectHistory] = useState([]); 
  const [data, setData] = useState({ projectId: null, projectTitle: "", shots: [], activeShotId: null });

  // --- AUTHENTICATION LISTENER ---
  // This watches to see if someone is logged in or logged out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- AUTHENTICATION FUNCTIONS ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthError('');
    } catch (error) {
      setAuthError(error.message.replace('Firebase: ', ''));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthError('');
    } catch (error) {
      setAuthError(error.message.replace('Firebase: ', ''));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setViewMode('portal');
  };

  // --- PROJECT FUNCTIONS ---
  const activeShot = data.shots.find(s => s.id === data.activeShotId) || null;

  const openProject = (project) => {
    setData({
      projectId: project.id,
      projectTitle: project.title,
      shots: project.shots,
      activeShotId: project.shots[0]?.id || null
    });
    setViewMode('dashboard');
  };

  useEffect(() => {
    if (data.projectId) {
      setProjectHistory(prev => prev.map(proj => 
        proj.id === data.projectId ? { ...proj, shots: data.shots } : proj
      ));
    }
  }, [data.shots, data.projectId]);

  const updateStatus = (newStatus) => {
    setData(prev => ({
      ...prev,
      shots: prev.shots.map(s => s.id === prev.activeShotId ? { ...s, status: newStatus } : s)
    }));
  };

  const updateBestTake = (takeNumber) => {
    setData(prev => ({
      ...prev,
      shots: prev.shots.map(s => s.id === prev.activeShotId ? { ...s, bestTake: takeNumber } : s)
    }));
  };

  const skipShot = () => {
    const currentShots = [...data.shots];
    const index = currentShots.findIndex(s => s.id === data.activeShotId);
    if (index > -1) {
      const [skipped] = currentShots.splice(index, 1);
      skipped.status = 'SKIPPED';
      setData(prev => ({
        ...prev,
        shots: [...currentShots, skipped],
        activeShotId: currentShots[0]?.id || skipped.id
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let allItems = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach(item => {
          const text = item.str.trim();
          if (text) {
            allItems.push({ text, x: item.transform[4], y: item.transform[5], page: i });
          }
        });
      }

      const page1Items = allItems.filter(i => i.page === 1).sort((a, b) => b.y - a.y);
      const topItems = page1Items.slice(0, Math.min(150, page1Items.length)); 

      const headerKeywords = [
        { id: "SHOT", regex: /SHOT/i },
        { id: "EQUIPMENT", regex: /EQUIPMENT|EQUIP/i },
        { id: "MOVEMENT", regex: /MOVEMENT/i },
        { id: "ANGLE", regex: /ANGLE/i },
        { id: "SIZE", regex: /SIZE/i },
        { id: "LENS", regex: /LENS/i },
        { id: "APERTURE", regex: /APERTURE/i },
        { id: "TIME", regex: /TIME/i },
        { id: "DESCRIPTION", regex: /DESCRIPTION|DESC/i },
        { id: "LIGHTING", regex: /LIGHTING|LIGHT/i },
        { id: "REFERENCE", regex: /REFERENCE|REF/i },
        { id: "NOTES", regex: /^NOTES/i },
        { id: "DIRECTOR", regex: /DIRECTOR/i }
      ];

      let columns = [];
      headerKeywords.forEach(hk => {
        const found = topItems.filter(item => hk.regex.test(item.text)).sort((a,b) => b.y - a.y)[0];
        if (found) columns.push({ name: hk.id, x: found.x });
      });

      if (!columns.find(c => c.name === "SHOT")) columns.push({ name: "SHOT", x: 0 });
      columns.sort((a, b) => a.x - b.x);

      for (let i = 0; i < columns.length; i++) {
        columns[i].startX = i === 0 ? 0 : columns[i].x - 5; 
        columns[i].endX = i < columns.length - 1 ? columns[i+1].x - 5 : 9999;
      }

      let allExtractedShots = [];
      let currentShot = null;
      const pages = [...new Set(allItems.map(i => i.page))];
      
      pages.forEach(pageNum => {
        const pageItems = allItems.filter(i => i.page === pageNum);
        const rows = {};
        pageItems.forEach(item => {
          const yKey = Math.round(item.y / 8) * 8;
          if (!rows[yKey]) rows[yKey] = [];
          rows[yKey].push(item);
        });

        const sortedY = Object.keys(rows).sort((a, b) => b - a);
        const shotCol = columns.find(c => c.name === "SHOT");

        sortedY.forEach(y => {
          const rowItems = rows[y];
          const isShotId = (txt) => /^[0-9]+[A-Z]?/.test(txt) && txt.length <= 4;
          const shotIdItem = rowItems.find(item => 
            item.x >= shotCol.startX && item.x < shotCol.endX && isShotId(item.text)
          );

          if (shotIdItem) {
            if (currentShot) allExtractedShots.push(currentShot);
            
            currentShot = {
              id: Math.random(),
              shotNum: shotIdItem.text.replace(/[^0-9A-Z]/g, ''), 
              status: "QUEUED",
              details: {}
            };
            Object.keys(CATEGORIES).forEach(k => currentShot.details[k] = "N/A");

            columns.forEach(col => {
              if (col.name === "SHOT") return;
              const textInCol = rowItems
                .filter(i => i.x >= col.startX && i.x < col.endX)
                .map(i => i.text).join(" ");
              if (textInCol && currentShot.details[col.name] !== undefined) {
                currentShot.details[col.name] = textInCol;
              }
            });

          } else if (currentShot) {
            columns.forEach(col => {
              if (col.name === "SHOT") return;
              const textInCol = rowItems
                .filter(i => i.x >= col.startX && i.x < col.endX)
                .map(i => i.text).join(" ");
                
              if (textInCol && currentShot.details[col.name] !== undefined) {
                if (currentShot.details[col.name] === "N/A") {
                  currentShot.details[col.name] = textInCol;
                } else {
                  currentShot.details[col.name] += " " + textInCol;
                }
              }
            });
          }
        });
      });

      if (currentShot) allExtractedShots.push(currentShot);
      if (allExtractedShots.length === 0) throw new Error("Could not parse table structure.");

      const newProj = { 
        id: Date.now(), 
        title: file.name.replace('.pdf', '').toUpperCase(), 
        date: new Date().toLocaleDateString(), 
        shots: allExtractedShots 
      };
      
      setProjectHistory(prev => [newProj, ...prev]);
      openProject(newProj);
    } catch (err) { 
      alert("Error: " + err.message); 
    } finally { setIsUploading(false); }
  };

  // --- RENDER LOGIC ---

  // If no user is logged in, ONLY show the Login Screen
  if (!user) {
    return (
      <div className="portal-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ background: '#161b22', padding: '40px', borderRadius: '12px', width: '350px', border: '1px solid #30363d' }}>
          <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '20px', fontSize: '24px', letterSpacing: '2px' }}>SHOT FLOW</h1>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: 'white' }}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #30363d', background: '#0d1117', color: 'white' }}
            />
            
            {authError && <div style={{ color: '#ff7b72', fontSize: '12px', textAlign: 'center' }}>{authError}</div>}
            
            <button type="button" onClick={handleLogin} className="btn-primary" style={{ marginTop: '10px' }}>LOG IN</button>
            <button type="button" onClick={handleSignUp} className="btn-outline" style={{ marginTop: '5px' }}>CREATE ACCOUNT</button>
          </form>
        </div>
      </div>
    );
  }

  // If user IS logged in, show the Portal
  if (viewMode === 'portal') return (
    <div className="portal-root">
      <div className="portal-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 className="portal-logo" style={{ marginBottom: 0 }}>SHOT FLOW</h1>
          <button className="btn-outline-header" onClick={handleLogout}>LOG OUT</button>
        </div>
        <div className="portal-grid">
          <section>
            <h3 className="section-label">PROJECT ARCHIVE</h3>
            {projectHistory.length === 0 && <p className="empty-msg">NO PROJECTS SAVED.</p>}
            {projectHistory.map(p => (
              <div key={p.id} className="history-card" onClick={() => openProject(p)}>
                <div>
                  <div className="card-title">{p.title}</div>
                </div>
                <button className="btn-remove-ghost" onClick={(e) => { e.stopPropagation(); setProjectHistory(prev => prev.filter(proj => proj.id !== p.id)); }}>
                  REMOVE
                </button>
              </div>
            ))}
          </section>
          <section>
            <h3 className="section-label">NEW IMPORT</h3>
            <div className="upload-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: '#888' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <input type="file" accept=".pdf" onChange={handleFileUpload} className="file-input" />
              <p className="upload-text">{isUploading ? "SCANNING HEADERS..." : "UPLOAD PDF SHOT LIST"}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  // Otherwise show the Dashboard
  return (
    <div className="dashboard-root">
      <header className="header">
        <button className="btn-outline-header" onClick={() => setViewMode('portal')}>BACK</button>
        <div className="project-header-title">{data.projectTitle}</div>
        <div style={{ width: '80px' }}></div>
      </header>
      <main className="main-layout">
        <div className="panel">
          <div className="panel-header">SHOT LIST ({data.shots.length})</div>
          <div className="panel-content-list">
            {data.shots.map(s => {
              const statusClass = s.status.toLowerCase().replace(' ', '-');
              
              return (
                <div 
                  key={s.id} 
                  className={`shot-item ${data.activeShotId === s.id ? 'active' : ''} ${statusClass}`} 
                  onClick={() => setData({ ...data, activeShotId: s.id })}
                >
                  <div className="shot-item-top">
                    <span key={s.status} className={`status-tag ${statusClass}`}>
                      {s.status === 'WRAPPED' ? '✓ WRAPPED' : s.status}
                    </span>
                  </div>
                  <div className="shot-number-label">
                    SHOT {s.shotNum}
                    {s.bestTake && (
                      <span style={{ color: '#ffd700', marginLeft: '10px', fontSize: '12px' }}>
                        ★ Take {s.bestTake}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel detail-panel">
          <div className="panel-header">DETAILS</div>
          <div className="panel-content">
            {activeShot ? (
              <div className="details-container">
                <h1 className="detail-title">SHOT {activeShot.shotNum}</h1>
                <div className="details-grid">
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <div key={key} className={`detail-row ${key === 'DESCRIPTION' || key === 'NOTES' || key === 'DIRECTOR' ? 'full-width' : ''}`}>
                      <span className="detail-label">{label}</span>
                      <span className={`detail-value ${activeShot.details[key] === 'N/A' ? 'dim' : ''}`}>
                        {activeShot.details[key]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <div className="empty-msg">SELECT A SHOT</div>}
          </div>
        </div>

        <div className="panel panel-fixed-actions">
          <div className="panel-header">ACTIONS</div>
          <div className="panel-content-actions">
            <button className="btn-success" onClick={() => updateStatus('IN PROGRESS')}>IN PROGRESS</button>
            <button className="btn-primary" onClick={() => updateStatus('WRAPPED')}>WRAPPED</button>
            <button className="btn-danger-ghost" onClick={() => updateStatus('RESHOOT')}>RESHOOT</button>
            <button className="btn-outline" onClick={skipShot}>SKIP SHOT</button>
            
            <div className="best-take-input-group" style={{ marginTop: '20px' }}>
              <label className="detail-label" style={{ display: 'block', marginBottom: '8px' }}>
                LOG BEST TAKE
              </label>
              <input 
                type="number" 
                placeholder="Take #" 
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  background: '#0d1117', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  color: 'white',
                  borderRadius: '10px',
                  boxSizing: 'border-box',
                  fontFamily: "'Inter', sans-serif"
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateBestTake(e.target.value);
                    e.target.value = ''; 
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}