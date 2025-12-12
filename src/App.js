import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import HeaderSection from './HeaderSection';
import AircraftModelViewer from './AircraftModelViewer';
import Overlay from './Overlay';
import TimetableOverlay from './TimetableOverlay';
import SettingsOverlay from './SettingsOverlay';
import MaintenanceOverlay from './MaintenanceOverlay';
import PrognosisOverlay from './PrognosisOverlay';
import { partData as initialPartData } from './partData_787-9_9V-SCA.js';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [selectedPart, setSelectedPart] = useState(null);

  const [showTimetable, setShowTimetable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showPrognosis, setShowPrognosis] = useState(false);
  const [modelName, setModelName] = useState('787-9_9V-SCA');

  const [partData, setPartData] = useState(initialPartData);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [currentMaintenanceTasks, setCurrentMaintenanceTasks] = useState([]);
  const [pastMaintenanceTasks, setPastMaintenanceTasks] = useState([]);
  const [prognosisPart, setPrognosisPart] = useState(null);
  const [predictions, setPredictions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [customFlights, setCustomFlights] = useState(() => {
    const saved = localStorage.getItem('customFlights');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingFlight, setEditingFlight] = useState(null);
  const [loadingPrognosis, setLoadingPrognosis] = useState(true);

  const processPartData = (parts) => {
    const partValues = Object.values(parts);
    const totalAirframeHours = partValues.find(p => p.name === "Fuselage")?.usedHours || 0;
    const engineParts = partValues.filter(p => p.name.includes("Engine"));
    const engineHours = engineParts.reduce((sum, p) => sum + p.usedHours, 0) / (engineParts.length || 1);
    const today = new Date();
    const daysSinceLastMaintenance = Math.min(...partValues.map(p => (today - new Date(p.lastCheck)) / (1000 * 60 * 60 * 24)));
    const maintenanceActionsLastYear = partValues.filter(p => (today - new Date(p.lastCheck)) / (1000 * 60 * 60 * 24) <= 365).length;
    const componentAgeHours = partValues.reduce((max, p) => Math.max(max, p.usedHours), 0);
    return { total_airframe_hours: totalAirframeHours, engine_hours: engineHours, days_since_last_maintenance: daysSinceLastMaintenance, maintenance_actions_last_year: maintenanceActionsLastYear, component_age_hours: componentAgeHours };
  };

  // Airport data moved to PrognosisOverlay.jsx

  const getHistoricalWeather = (destination, dateString) => {
    const date = new Date(dateString + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      return { temperature_c: 15, humidity_pct: 60, precipitation_mm: 1, wind_speed_kts: 15, visibility_km: 8, sand_dust_index: 10 };
    }
    const month = date.getUTCMonth();
    const weatherBySeason = { 'LHR': { temp: [5, 8, 12, 15, 18, 15, 12, 8], humidity: [80, 75, 70, 65, 70, 75, 80, 85] }, 'JFK': { temp: [-2, 5, 12, 20, 25, 22, 15, 5], humidity: [65, 60, 65, 70, 75, 70, 65, 60] }, 'DXB': { temp: [24, 28, 32, 38, 42, 38, 32, 28], humidity: [60, 55, 50, 45, 50, 55, 60, 65] }, 'SIN': { temp: [27, 28, 28, 29, 28, 28, 27, 27], humidity: [85, 82, 83, 84, 85, 86, 87, 86] } };
    const defaultWeather = { temp: 15, humidity: 60, precipitation: 1, wind: 15, visibility: 8, sand_dust: 10 };
    const seasonIndex = Math.floor(month / 1.5);
    const weatherPattern = weatherBySeason[destination] || { temp: Array(8).fill(defaultWeather.temp), humidity: Array(8).fill(defaultWeather.humidity) };
    return { temperature_c: weatherPattern.temp[seasonIndex] + (Math.random() - 0.5) * 5, humidity_pct: weatherPattern.humidity[seasonIndex] + (Math.random() - 0.5) * 10, precipitation_mm: Math.random() * 5, wind_speed_kts: 10 + Math.random() * 10, visibility_km: 5 + Math.random() * 5, sand_dust_index: 5 + Math.random() * 15 };
  };

  const fetchPredictions = useCallback(async () => {
    setLoadingPrognosis(true);
    try {
      // In a real app, this would fetch from a backend.
      // For GitHub Pages, we use a static JSON file.
      const response = await fetch(`${process.env.PUBLIC_URL}/mock_predictions.json`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error("Failed to fetch mock predictions:", error);
      // Optionally, set some error state to show in the UI
    } finally {
      setLoadingPrognosis(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const handleAddCustomFlight = async (customFlightForm) => {
    // This functionality is disabled in the static version.
    alert("Adding flights is not supported in this demo version.");
  };

  const handleEditFlight = (flightId) => {
    // This functionality is disabled in the static version.
    alert("Editing flights is not supported in this demo version.");
  };

  const handleUpdateFlight = async (updatedFlightForm, flightId) => {
    // This functionality is disabled in the static version.
    alert("Updating flights is not supported in this demo version.");
  };

  const handleRemoveFlight = (flightId) => {
    setPredictions(prev => prev.filter(flight => flight.flight_id !== flightId));
    setCustomFlights(prev => {
      const updated = prev.filter(flight => flight.flight_id !== flightId);
      localStorage.setItem('customFlights', JSON.stringify(updated));
      return updated;
    });
  };

  const handleModelChange = (newModelName) => { setModelName(newModelName); };
  useEffect(() => { if (theme === 'dark') { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.remove('dark'); } localStorage.setItem('theme', theme); }, [theme]);
  const handlePartClick = (part) => { setSelectedPart(part); };
  const handleCloseOverlay = () => { setSelectedPart(null); };
  const handleTimetableClick = () => { setShowTimetable(true); };
  const handleCloseTimetable = () => { setShowTimetable(false); };
  const handleSettingsClick = () => { setShowSettings(true); };
  const handleCloseSettings = () => { setShowSettings(false); };
  const handleMaintenanceClick = () => { setShowMaintenance(true); };
  const handleCloseMaintenance = () => { setShowMaintenance(false); setPrognosisPart(null); };
  const handlePrognosisClick = () => { setShowPrognosis(true); };
  const handleClosePrognosis = () => { setShowPrognosis(false); };
  const handleScheduleMaintenance = (partName) => { setPrognosisPart(partName); setShowPrognosis(false); setShowMaintenance(true); };
  
  const handleAddTask = (newTask) => {
    setMaintenanceTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleMoveToCurrent = (task) => {
    setMaintenanceTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    setCurrentMaintenanceTasks(prevTasks => [...prevTasks, { ...task, status: 'In Progress' }]);
  };

  const handleCompleteTask = (task) => {
    setCurrentMaintenanceTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    setPastMaintenanceTasks(prevTasks => [...prevTasks, { ...task, status: 'Completed' }]);
    setPartData(prevPartData => {
      const newPartData = { ...prevPartData };
      const part = newPartData[task.part];
      if (part) {
        if (task.type === 'Replacement' || task.type === 'New Part') {
          part.usedHours = 0;
        }
        part.lastCheck = new Date().toISOString().split('T')[0];
      }
      return newPartData;
    });
  };

  return (
    <div className="bg-white dark:bg-[#020617] text-gray-900 dark:text-white h-screen overflow-hidden relative">
      <HeaderSection onTimetableClick={handleTimetableClick} onSettingsClick={handleSettingsClick} onMaintenanceClick={handleMaintenanceClick} onPrognosisClick={handlePrognosisClick} theme={theme} onModelChange={handleModelChange} />
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <AircraftModelViewer onPartClick={handlePartClick} theme={theme} modelName={modelName} />
      </div>
      <Overlay part={selectedPart} onClose={handleCloseOverlay} theme={theme} />

      {showTimetable && <TimetableOverlay onClose={handleCloseTimetable} theme={theme} />}
      {showSettings && <SettingsOverlay onClose={handleCloseSettings} theme={theme} onThemeChange={setTheme} />}
      {showMaintenance && <MaintenanceOverlay onClose={handleCloseMaintenance} theme={theme} maintenanceTasks={maintenanceTasks} currentMaintenanceTasks={currentMaintenanceTasks} pastMaintenanceTasks={pastMaintenanceTasks} onAddTask={handleAddTask} onMoveToCurrent={handleMoveToCurrent} onCompleteTask={handleCompleteTask} prognosisPart={prognosisPart} />}
      {showPrognosis && <PrognosisOverlay onClose={handleClosePrognosis} theme={theme} partData={partData} onScheduleMaintenance={handleScheduleMaintenance} predictions={predictions} onAddCustomFlight={handleAddCustomFlight} onEditFlight={handleEditFlight} onRemoveFlight={handleRemoveFlight} onUpdateFlight={handleUpdateFlight} editingFlight={editingFlight} loading={loadingPrognosis} />}
    </div>
  );
}

export default App;
