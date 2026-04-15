import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// THE DEFINITIVE FIX: No local imports. We pull the exact matching v3 worker directly from the cloud.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

import Browser from './components/Browser';
import Controller from './components/Controller';
import DetailView from './components/DetailView';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState('portal');
  const [isUploading, setIsUploading] = useState(false);
  const [projectHistory, setProjectHistory] = useState([
    { id: 'p1', title: 'MIDNIGHT_RISES', date: '2026-04-15' },
    { id: 'p2', title: 'NEON_SHADOWS', date: '2026-03-10' }
  ]);

  const [data, setData] = useState({ 
    projectTitle: "PENDING_IMPORT", 
    day: "01", 
    shots: [], 
    activeShotId: null 
  });

  const activeShot = data.shots.find(s => s.id === data.activeShotId) || null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const typedarray = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument(typedarray);
        const pdf = await loadingTask.promise;
        let fullText = "";

        // Extract text content from every page in the PDF
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(" ");
        }

        // PARSER: We look for the word "SCENE" or "Scene" followed by a number
        const sceneMatches = fullText.match(/SCENE\s*\d+/gi);
        
        // If no scenes are found, we create a fallback list so the app doesn't break
        const finalMatches = sceneMatches || ["SCENE_DEFAULT"];

        const extractedShots = finalMatches.map((match, index) => ({
          id: `shot-${index}`,
          scene: match.toUpperCase().replace("SCENE", "").trim(),
          shotNum: (index + 1).toString(),
          status: "ready",
          desc: "DYNAMICALLY_PARSED_FROM_SOURCE",
          tech: { 
            lens: "DETECTING...", 
            aperture: "ANALYZING...", 
            movement: "EXTRACTED", 
            equip: "PDF_DATA" 
          }
        }));

        const fileName = file.name.replace(".pdf", "").toUpperCase();

        setData({
          projectTitle: fileName,
          day: "01",
          shots: extractedShots,
          activeShotId: extractedShots[0]?.id || null
        });

        // Add this new upload to our History sidebar
        setProjectHistory(prev => [{ id: Date.now(), title: fileName, date: '2026-04-15' }, ...prev]);
        setViewMode('dashboard');
      } catch (error) {
        console.error("PDF Parsing Error:", error);
        alert(`SYSTEM_ERROR: ${error.message || "UNKNOWN_CORRUPTION_DETECTED"}`);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpdateStatus = (newStatus) => {
    const updatedShots = data.shots.map(shot => 
      shot.id === data.activeShotId ? { ...shot, status: newStatus } : shot
    );
    setData({ ...data, shots: updatedShots });
  };

  if (viewMode === 'portal') {
    return (
      <div className="portal-root mono">
        <div className="portal-container">
          <h1 className="portal-logo">SYSTEM_PORTAL_V2.0</h1>
          <div className="portal-grid">
            <section className="portal-section">
              <h2 className="panel-label">PROJECT_ARCHIVE</h2>
              {projectHistory.map(proj => (
                <div key={proj.id} className="history-card" onClick={() => setViewMode('dashboard')}>
                  <span className="dim">{proj.date}</span>
                  <span className="bold">{proj.title}</span>
                </div>
              ))}
            </section>

            <section className="portal-section">
              <h2 className="panel-label">NEW_IMPORT_SCAN</h2>
              <div className="upload-box">
                {isUploading ? (
                  <div className="loading-state">
                    <p className="blink">SCANNING_PDF_COORDINATES...</p>
                  </div>
                ) : (
                  <>
                    <p>DROP_SHOT_LIST.PDF</p>
                    <input type="file" accept=".pdf" onChange={handleFileUpload} className="file-input" />
                    <button className="upload-btn">BEGIN_EXTRACTION</button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sandbox-root mono">
      <header className="production-header">
        <button onClick={() => setViewMode('portal')} className="back-btn">[TERMINATE_SESSION]</button>
        <h1>{data.projectTitle} // DAY_{data.day}</h1>
      </header>
      <main className="panel-container">
        <Browser 
          shots={data.shots} 
          activeId={data.activeShotId} 
          onSelect={(id) => setData({...data, activeShotId: id})} 
        />
        <DetailView shot={activeShot} />
        <Controller 
          currentStatus={activeShot ? activeShot.status : 'ready'} 
          onUpdate={handleUpdateStatus} 
        />
      </main>
    </div>
  );
}

export default App;