import { useState } from 'react'
import './App.css'
import Browser from './components/Browser'
import DetailView from './components/DetailView'
import Controller from './components/Controller'

function App() {
  const [data, setData] = useState({
    selectedSceneId: 1,
    scenes: [
      { id: 1, slugline: "INT. APARTMENT - DAY", status: "Ready", type: "INT", description: "The protagonist discovers the hidden letter.", cast: ["Aria", "Ben"] },
      { id: 2, slugline: "EXT. ALLEYWAY - NIGHT", status: "In Progress", type: "EXT", description: "Ben escapes through the back fire exit.", cast: ["Ben", "Thug #1"] },
      { id: 3, slugline: "INT. OFFICE - DAY", status: "Ready", type: "INT", description: "The confrontation with the boss.", cast: ["Aria", "Boss"] }
    ]
  });

  const currentScene = data.scenes.find(s => s.id === data.selectedSceneId);

  const handleSelectScene = (id) => {
    setData({ ...data, selectedSceneId: id });
  };

  // NEW LOGIC: Updates the status of a specific scene in the array
  const handleUpdateStatus = (id, newStatus) => {
    const updatedScenes = data.scenes.map(scene => {
      if (scene.id === id) {
        return { ...scene, status: newStatus };
      }
      return scene;
    });
    setData({ ...data, scenes: updatedScenes });
  };

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
      <h1>Call Time: Production Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <Browser 
          scenes={data.scenes} 
          selectedId={data.selectedSceneId} 
          onSelect={handleSelectScene} 
        />
        <DetailView scene={currentScene} />
        <Controller 
          selectedScene={currentScene} 
          onUpdateStatus={handleUpdateStatus} 
        />
      </div>
    </div>
  )
}

export default App