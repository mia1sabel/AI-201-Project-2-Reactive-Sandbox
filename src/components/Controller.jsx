export default function Controller({ selectedScene, onUpdateStatus }) {
  if (!selectedScene) return <div className="panel controller"><h2>Production Desk</h2><p>No scene selected</p></div>;

  return (
    <div className="panel controller">
      <h2>Production Desk</h2>
      <p>Managing Scene: <strong>{selectedScene.slugline}</strong></p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => onUpdateStatus(selectedScene.id, 'In Progress')}>
          Start Filming
        </button>
        <button onClick={() => onUpdateStatus(selectedScene.id, 'Wrapped')} style={{ backgroundColor: '#ff8c00', color: 'white' }}>
          Mark as Wrapped
        </button>
      </div>
    </div>
  );
}