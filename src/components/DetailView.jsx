export default function DetailView({ scene }) {
  if (!scene) return <div className="panel detail">Select a scene to see details</div>;

  return (
    <div className="panel detail">
      <h2>Scene Breakdown</h2>
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>{scene.slugline}</h3>
        <p style={{ fontStyle: 'italic', color: '#555' }}>{scene.description}</p>
        <hr />
        <p><strong>Cast:</strong> {scene.cast.join(', ')}</p>
        <p><strong>Location:</strong> {scene.type} Shot</p>
        <p><strong>Current Status:</strong> <span style={{ color: scene.status === 'Wrapped' ? 'green' : 'orange' }}>{scene.status}</span></p>
      </div>
    </div>
  );
}