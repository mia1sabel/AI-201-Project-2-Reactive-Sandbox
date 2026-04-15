import React from 'react';

const DetailView = ({ shot }) => {
  // Safety check: if no shot is selected, show a message
  if (!shot) return <div className="panel detail mono">OFFLINE: SELECT_SHOT</div>;

  return (
    <div className="panel detail">
      <h2 className="panel-label mono">TECHNICAL_SPECS</h2>
      <div className="spec-grid mono">
        <div className="spec-item"><label>LENS</label><span>{shot.tech.lens}</span></div>
        <div className="spec-item"><label>APERTURE</label><span>{shot.tech.aperture}</span></div>
        <div className="spec-item"><label>MOVE</label><span>{shot.tech.movement}</span></div>
        <div className="spec-item"><label>GEAR</label><span>{shot.tech.equip}</span></div>
      </div>
      <div className="shot-intent mono">
        <label>DIRECTOR_NOTE:</label>
        <p>{shot.desc}</p>
      </div>
    </div>
  );
};

export default DetailView;