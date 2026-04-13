export default function Browser({ scenes, selectedId, onSelect }) {
  return (
    <div className="panel browser">
      <h2>Daily Strip</h2>
      {scenes.map(scene => (
        <div 
          key={scene.id} 
          className={`scene-card ${selectedId === scene.id ? 'active' : ''}`}
          onClick={() => onSelect(scene.id)}
          style={{ 
            border: selectedId === scene.id ? '2px solid orange' : '1px solid #ccc', 
            margin: '10px', 
            padding: '10px', 
            cursor: 'pointer',
            backgroundColor: selectedId === scene.id ? '#f0f0f0' : 'white'
          }}
        >
          <strong>{scene.slugline}</strong> <br />
          <small>Status: {scene.status}</small>
        </div>
      ))}
    </div>
  );
}