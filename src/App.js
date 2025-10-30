import React, { useState } from 'react';
import './App.css';
import HeaderSection from './HeaderSection';
import AircraftModelViewer from './AircraftModelViewer';
import Overlay from './Overlay';

function App() {
  const [selectedPart, setSelectedPart] = useState(null);

  const handlePartClick = (part) => {
    setSelectedPart(part);
  };

  const handleCloseOverlay = () => {
    setSelectedPart(null);
  };

  return (
    <div className="bg-[#020617] text-white h-screen overflow-hidden relative">
      <HeaderSection />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <AircraftModelViewer onPartClick={handlePartClick} />
      </div>
      <Overlay part={selectedPart} onClose={handleCloseOverlay} />
    </div>
  );
}

export default App;