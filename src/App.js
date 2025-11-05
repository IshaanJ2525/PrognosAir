import React, { useState, useEffect } from 'react';
import './App.css';
import HeaderSection from './HeaderSection';
import AircraftModelViewer from './AircraftModelViewer';
import Overlay from './Overlay';
import HazardsOverlay from './HazardsOverlay';
import TimetableOverlay from './TimetableOverlay';
import SettingsOverlay from './SettingsOverlay';
import MaintenanceOverlay from './MaintenanceOverlay';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [selectedPart, setSelectedPart] = useState(null);
  const [showHazards, setShowHazards] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [modelName, setModelName] = useState('787-9_9V-SCA');

  const handleModelChange = (newModelName) => {
    setModelName(newModelName);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handlePartClick = (part) => {
    setSelectedPart(part);
  };

  const handleCloseOverlay = () => {
    setSelectedPart(null);
  };

  const handleHazardsClick = () => {
    setShowHazards(true);
  };

  const handleCloseHazards = () => {
    setShowHazards(false);
  };

  const handleTimetableClick = () => {
    setShowTimetable(true);
  };

  const handleCloseTimetable = () => {
    setShowTimetable(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleMaintenanceClick = () => {
    setShowMaintenance(true);
  };

  const handleCloseMaintenance = () => {
    setShowMaintenance(false);
  };

  return (
    <div className="bg-white dark:bg-[#020617] text-gray-900 dark:text-white h-screen overflow-hidden relative">
      <HeaderSection onHazardsClick={handleHazardsClick} onTimetableClick={handleTimetableClick} onSettingsClick={handleSettingsClick} onMaintenanceClick={handleMaintenanceClick} theme={theme} onModelChange={handleModelChange} />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <AircraftModelViewer onPartClick={handlePartClick} theme={theme} modelName={modelName} />
      </div>
      <Overlay part={selectedPart} onClose={handleCloseOverlay} theme={theme} />
      {showHazards && <HazardsOverlay onClose={handleCloseHazards} theme={theme} />}
      {showTimetable && <TimetableOverlay onClose={handleCloseTimetable} theme={theme} />}
      {showSettings && <SettingsOverlay onClose={handleCloseSettings} theme={theme} onThemeChange={setTheme} />}
      {showMaintenance && <MaintenanceOverlay onClose={handleCloseMaintenance} theme={theme} />}
    </div>
  );
}

export default App;
