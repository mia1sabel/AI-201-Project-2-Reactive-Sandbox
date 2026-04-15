import React from 'react';

const Controller = ({ currentStatus, onUpdate }) => {
  const statusOptions = ['ready', 'in-progress', 'wrapped'];

  return (
    <div className="panel controller">
      <h2 className="panel-label mono">SYSTEM_CONTROLS</h2>
      <div className="control-group">
        <label className="mono">SET_STATUS</label>
        {statusOptions.map((status) => (
          <button 
            key={status}
            className={`control-btn ${currentStatus === status ? 'active' : ''}`}
            onClick={() => onUpdate(status)}
          >
            {status.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Controller;