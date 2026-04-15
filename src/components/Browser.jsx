import React from 'react';

const Browser = ({ shots, activeId, onSelect }) => {
  return (
    <div className="panel browser">
      <h2 className="panel-label">SHOT_LOG</h2>
      {shots.map((shot) => (
        <div 
          key={shot.id} 
          className={`strip ${shot.id === activeId ? 'active' : ''}`} 
          onClick={() => onSelect(shot.id)}
        >
          <span className={`status-dot ${shot.status}`}></span>
          <span className="bold">{shot.scene}-{shot.shotNum}</span>
          <p className="dim-text">{shot.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default Browser;