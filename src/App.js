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
    const scheduledFlights = [];
    const today = new Date();
    const destinations = ['LHR', 'CDG', 'DXB', 'JFK', 'SIN', 'FRA', 'AMS', 'HKG', 'IST', 'LAX', 'NRT', 'ICN', 'BKK', 'KUL', 'CGK'];
    let currentPartData = JSON.parse(JSON.stringify(partData));

    // Define scenarios for each flight to create diverse predictions
    const scenarios = [
      { name: 'Normal Long Haul', daysOffset: 1, destinationIndex: 0, flightHours: 10 + Math.random() * 4, cycles: 1, altitude: 35000 + Math.random() * 5000, sectorLength: 5000 + Math.random() * 2000, weatherMultiplier: 1, partWear: 'balanced' },
      { name: 'Engine Stress', daysOffset: 7, destinationIndex: 1, flightHours: 12 + Math.random() * 3, cycles: 1, altitude: 32000 + Math.random() * 4000, sectorLength: 4500 + Math.random() * 1500, weatherMultiplier: 1.2, partWear: 'engine' },
      { name: 'Hydraulic Load', daysOffset: 14, destinationIndex: 2, flightHours: 8 + Math.random() * 4, cycles: 1, altitude: 30000 + Math.random() * 3000, sectorLength: 3500 + Math.random() * 1000, weatherMultiplier: 0.8, partWear: 'hydraulic' },
      { name: 'Cold Weather', daysOffset: 21, destinationIndex: 3, flightHours: 9 + Math.random() * 3, cycles: 1, altitude: 28000 + Math.random() * 2000, sectorLength: 4000 + Math.random() * 1000, weatherMultiplier: 0.5, partWear: 'structural' },
      { name: 'High Humidity', daysOffset: 28, destinationIndex: 4, flightHours: 11 + Math.random() * 4, cycles: 1, altitude: 33000 + Math.random() * 4000, sectorLength: 4800 + Math.random() * 2000, weatherMultiplier: 1.5, partWear: 'corrosion' }
    ];

    for (let i = 0; i < 5; i++) {
      const scenario = scenarios[i];
      const flightDate = new Date(today);
      flightDate.setDate(today.getDate() + scenario.daysOffset);
      const dateStr = flightDate.toISOString().split('T')[0];
      const flightNum = String(1000 + i).padStart(4, '0');
      const destination = destinations[scenario.destinationIndex];
      const flight_hours = scenario.flightHours;
      const cycles = scenario.cycles;

      // Apply scenario-based part wear
      Object.keys(currentPartData).forEach(partName => {
        let wearMultiplier = 1;
        if (scenario.partWear === 'engine' && partName.includes('Engine')) wearMultiplier = 1.5;
        else if (scenario.partWear === 'hydraulic' && (partName.includes('Hydraulic') || partName.includes('Flap') || partName.includes('Gear'))) wearMultiplier = 1.4;
        else if (scenario.partWear === 'structural' && (partName.includes('Fuselage') || partName.includes('Wing'))) wearMultiplier = 1.3;
        else if (scenario.partWear === 'corrosion' && (partName.includes('Gear') || partName.includes('Fuselage'))) wearMultiplier = 1.6;
        currentPartData[partName].usedHours += flight_hours * wearMultiplier;
      });

      const partBasedFeatures = processPartData(currentPartData);
      const baseWeather = getHistoricalWeather(destination, dateStr);
      // Adjust weather based on scenario
      const weather = {
        temperature_c: baseWeather.temperature_c * scenario.weatherMultiplier + (Math.random() - 0.5) * 10,
        humidity_pct: Math.min(100, Math.max(0, baseWeather.humidity_pct * scenario.weatherMultiplier + (Math.random() - 0.5) * 20)),
        precipitation_mm: baseWeather.precipitation_mm * scenario.weatherMultiplier + Math.random() * 5,
        wind_speed_kts: baseWeather.wind_speed_kts + (Math.random() - 0.5) * 10,
        visibility_km: Math.max(0, baseWeather.visibility_km + (Math.random() - 0.5) * 3),
        sand_dust_index: baseWeather.sand_dust_index + Math.random() * 10
      };

      const inputData = {
        flight_hours,
        cycles,
        ...partBasedFeatures,
        ...weather,
        avg_altitude_ft: scenario.altitude,
        sector_length_nm: scenario.sectorLength,
        turbulence_events: Math.floor(Math.random() * 4) + (scenario.weatherMultiplier > 1.2 ? 1 : 0),
        icing_reports: weather.temperature_c < 0 ? Math.floor(Math.random() * 3) + (scenario.name === 'Cold Weather' ? 2 : 0) : 0,
        num_open_MEL_items: Math.floor(Math.random() * 3) + (i > 2 ? 1 : 0),
        recent_minor_defects: Math.floor(Math.random() * 4) + (scenario.partWear !== 'balanced' ? 1 : 0),
        bird_strike_reports: Math.floor(Math.random() * 2),
        runway_incident_report: Math.floor(Math.random() * 1),
        crew_hours_last_7days: 30 + Math.random() * 30,
        turnaround_time_min: 40 + Math.random() * 30,
        part_data: currentPartData
      };

      try {
        const response = await fetch('http://localhost:8001/predict', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(inputData) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const predictionData = await response.json();
        scheduledFlights.push({
          flight_id: `SQ${flightNum}_${dateStr}_${destination}`,
          destination,
          ...predictionData,
          input_data: inputData,
          weather_data: { ...weather, is_extreme: weather.temperature_c < -5 || weather.humidity_pct > 90 },
          scenario: scenario.name
        });
      } catch (apiError) {
        console.warn(`Failed to get prediction for flight ${i + 1}, using fallback:`, apiError);
      }
    }
    setPredictions(scheduledFlights);
    setLoadingPrognosis(false);
  }, [partData]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const handleAddCustomFlight = async (customFlightForm) => {
    let currentPartData = JSON.parse(JSON.stringify(partData));
    predictions.forEach(flight => {
      Object.keys(currentPartData).forEach(partName => {
        currentPartData[partName].usedHours += flight.input_data.flight_hours;
      });
    });

    const { flight_name, flight_hours, cycles, destination, flight_date, avg_altitude_ft, sector_length_nm } = customFlightForm;

    const partBasedFeatures = processPartData(currentPartData);
    const weather = getHistoricalWeather(destination, flight_date);

    const inputData = {
      flight_hours: parseFloat(flight_hours),
      cycles: parseInt(cycles),
      ...partBasedFeatures,
      ...weather,
      avg_altitude_ft: parseFloat(avg_altitude_ft),
      sector_length_nm: parseFloat(sector_length_nm),
      turbulence_events: Math.floor(Math.random() * 3),
      icing_reports: weather.temperature_c < 0 ? Math.floor(Math.random() * 2) : 0,
      num_open_MEL_items: Math.floor(Math.random() * 2),
      recent_minor_defects: Math.floor(Math.random() * 3),
      bird_strike_reports: 0,
      runway_incident_report: 0,
      crew_hours_last_7days: 30 + Math.random() * 20,
      turnaround_time_min: 40 + Math.random() * 20,
      part_data: currentPartData
    };

    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const predictionData = await response.json();

    const customFlight = {
      flight_id: flight_name || `CUSTOM_${Date.now()}_${destination}`,
      flight_date: flight_date,
      destination: destination,
      ...predictionData,
      input_data: inputData,
      weather_data: {
          ...weather,
          is_extreme: weather.temperature_c < -5 || weather.humidity_pct > 90
      },
      is_custom: true
    };

    setPredictions(prev => [...prev, customFlight]);
    setCustomFlights(prev => {
      const updated = [...prev, customFlight];
      localStorage.setItem('customFlights', JSON.stringify(updated));
      return updated;
    });
  };

  const handleEditFlight = (flightId) => {
    const flightToEdit = predictions.find(flight => flight.flight_id === flightId);
    if (flightToEdit) {
      setEditingFlight(flightToEdit);
    }
  };

  const handleUpdateFlight = async (updatedFlightForm, flightId) => {
    const flightToUpdate = predictions.find(flight => flight.flight_id === flightId);
    if (!flightToUpdate) return;

    let currentPartData = JSON.parse(JSON.stringify(partData));
    predictions.forEach(flight => {
      if (flight.flight_id !== flightId) {
        Object.keys(currentPartData).forEach(partName => {
          currentPartData[partName].usedHours += flight.input_data.flight_hours;
        });
      }
    });

    const { flight_name, flight_hours, cycles, destination, flight_date, avg_altitude_ft, sector_length_nm } = updatedFlightForm;

    const partBasedFeatures = processPartData(currentPartData);
    const weather = getHistoricalWeather(destination, flight_date);

    const inputData = {
      flight_hours: parseFloat(flight_hours),
      cycles: parseInt(cycles),
      ...partBasedFeatures,
      ...weather,
      avg_altitude_ft: parseFloat(avg_altitude_ft),
      sector_length_nm: parseFloat(sector_length_nm),
      turbulence_events: Math.floor(Math.random() * 3),
      icing_reports: weather.temperature_c < 0 ? Math.floor(Math.random() * 2) : 0,
      num_open_MEL_items: Math.floor(Math.random() * 2),
      recent_minor_defects: Math.floor(Math.random() * 3),
      bird_strike_reports: 0,
      runway_incident_report: 0,
      crew_hours_last_7days: 30 + Math.random() * 20,
      turnaround_time_min: 40 + Math.random() * 20,
      part_data: currentPartData
    };

    const response = await fetch('http://localhost:8001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputData)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const predictionData = await response.json();

    const updatedFlight = {
      flight_id: flight_name || flightToUpdate.flight_id.split('_')[0],
      flight_date: flight_date,
      destination: destination,
      ...predictionData,
      input_data: inputData,
      weather_data: {
          ...weather,
          is_extreme: weather.temperature_c < -5 || weather.humidity_pct > 90
      },
      is_custom: flightToUpdate.is_custom // Preserve the original custom status
    };

    setPredictions(prev => prev.map(flight => flight.flight_id === flightId ? updatedFlight : flight));
    if (flightToUpdate.is_custom) {
      setCustomFlights(prev => {
        const updated = prev.map(flight => flight.flight_id === flightId ? updatedFlight : flight);
        localStorage.setItem('customFlights', JSON.stringify(updated));
        return updated;
      });
    }
    setEditingFlight(null);
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
