import React, { useState, useEffect } from 'react';

const PrognosisOverlay = ({ onClose, theme, partData: initialPartData, onScheduleMaintenance, predictions, onAddCustomFlight, onEditFlight, onRemoveFlight, onUpdateFlight, editingFlight, loading }) => {
  // Airport data with distance from Delhi (DEL) and typical flight parameters
  const airportData = {
    'LHR': { name: 'London Heathrow', distance_nm: 4200, altitude_ft: 35000, city: 'London' },
    'JFK': { name: 'John F. Kennedy', distance_nm: 7200, altitude_ft: 36000, city: 'New York' },
    'DXB': { name: 'Dubai International', distance_nm: 1300, altitude_ft: 38000, city: 'Dubai' },
    'SIN': { name: 'Singapore Changi', distance_nm: 2900, altitude_ft: 30000, city: 'Singapore' },
    'FRA': { name: 'Frankfurt Airport', distance_nm: 3800, altitude_ft: 35000, city: 'Frankfurt' },
    'AMS': { name: 'Amsterdam Schiphol', distance_nm: 4000, altitude_ft: 35000, city: 'Amsterdam' },
    'HKG': { name: 'Hong Kong International', distance_nm: 2400, altitude_ft: 33000, city: 'Hong Kong' },
    'IST': { name: 'Istanbul Airport', distance_nm: 3200, altitude_ft: 34000, city: 'Istanbul' },
    'LAX': { name: 'Los Angeles International', distance_nm: 8200, altitude_ft: 38000, city: 'Los Angeles' },
    'NRT': { name: 'Narita International', distance_nm: 3800, altitude_ft: 35000, city: 'Tokyo' },
    'ICN': { name: 'Incheon International', distance_nm: 3400, altitude_ft: 35000, city: 'Seoul' },
    'BKK': { name: 'Suvarnabhumi Airport', distance_nm: 2100, altitude_ft: 32000, city: 'Bangkok' },
    'KUL': { name: 'Kuala Lumpur International', distance_nm: 2700, altitude_ft: 31000, city: 'Kuala Lumpur' },
    'CGK': { name: 'Soekarno-Hatta', distance_nm: 3200, altitude_ft: 31000, city: 'Jakarta' },
    'CDG': { name: 'Charles de Gaulle', distance_nm: 4200, altitude_ft: 35000, city: 'Paris' }
  };
  const [error, setError] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

  const [showCustomFlightForm, setShowCustomFlightForm] = useState(false);
  const [editingFlightId, setEditingFlightId] = useState(null);
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatFlightHours = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const [customFlightForm, setCustomFlightForm] = useState({
    flight_name: '',
    flight_hours: 8,
    cycles: 1,
    destination: 'LHR',
    flight_date: new Date().toISOString().split('T')[0],
    avg_altitude_ft: 35000,
    sector_length_nm: 4000,
  });
  const [addingCustomFlight, setAddingCustomFlight] = useState(false);

  useEffect(() => {
    if (editingFlight) {
      setCustomFlightForm({
        flight_name: editingFlight.flight_id.split('_')[0],
        flight_hours: editingFlight.input_data.flight_hours,
        cycles: editingFlight.input_data.cycles,
        destination: editingFlight.destination,
        flight_date: editingFlight.flight_date || editingFlight.flight_id.split('_')[1],
        avg_altitude_ft: editingFlight.input_data.avg_altitude_ft,
        sector_length_nm: editingFlight.input_data.sector_length_nm,
      });
      setShowCustomFlightForm(true);
    }
  }, [editingFlight]);

  useEffect(() => {
    if (predictions && predictions.length > 0 && !selectedFlight) {
      setSelectedFlight(predictions[0]);
    }
  }, [predictions, selectedFlight]);



  const getIssueTypeName = (classId) => {
    const types = ['No Issue', 'Engine Degradation', 'Hydraulic Leak Risk', 'Avionics / Electrical Fault', 'Icing / Cold Weather Risk', 'Corrosion / Coating Deterioration'];
    return types[classId] || 'Unknown';
  };
  const getIssueTypeIcon = (classId) => {
    const icons = ['✅', '⚙️', '💧', '⚡️', '❄️', '🔩'];
    return icons[classId] || '❓';
  };

  const getRiskColor = (risk) => {
    if (risk < 0.1) return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
    if (risk < 0.2) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
  };
  const getRiskLevel = (risk) => {
    if (risk < 0.1) return 'Low';
    if (risk < 0.2) return 'Medium';
    return 'High';
  };

  const handleAddCustomFlight = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(customFlightForm.flight_date);

    if (selectedDate < today) {
      setError('Flight date cannot be in the past. Please select today or a future date.');
      return;
    }

    setAddingCustomFlight(true);
    try {
      if (editingFlight) {
        await onUpdateFlight(customFlightForm, editingFlight.flight_id);
      } else {
        await onAddCustomFlight(customFlightForm);
      }
      setShowCustomFlightForm(false);
      setError(null);
    } catch (error) {
      console.error('Failed to add/update custom flight:', error);
      setError('Failed to add/update custom flight. Please try again.');
    } finally {
      setAddingCustomFlight(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1B1C2A] dark:to-[#252634] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Analyzing Aircraft Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Running ML predictions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1B1C2A] dark:to-[#252634] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Prognosis</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl">
              ✕
            </button>
          </div>
          <div className="text-center text-red-500 py-8">
            <div className="text-4xl mb-4">⚠️</div>
            {error}
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    if (flightToDelete) {
      onRemoveFlight(flightToDelete);
      setFlightToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setFlightToDelete(null);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1B1C2A] dark:to-[#252634] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to remove this flight? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-[#1B1C2A] dark:to-[#252634] rounded-2xl shadow-2xl w-full max-w-[90vw] h-[95vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">Aircraft Prognosis</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">AI-Powered Maintenance Predictions</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2 rounded-lg">✕</button>
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="grid grid-cols-12 h-full">
              <div className="col-span-4 bg-gray-50 dark:bg-[#161722] p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Flights</h3>
                  <button onClick={() => {
                    setShowCustomFlightForm(!showCustomFlightForm);
                  }} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                    {showCustomFlightForm ? 'Cancel' : '+ Add Custom Flight'}
                  </button>
                </div>
                    {showCustomFlightForm && (
                      <div className="bg-white dark:bg-[#252634] rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editingFlight ? 'Edit Custom Flight' : 'Add Custom Flight'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Name</label>
                            <input
                              type="text"
                              placeholder="e.g., SQ1000"
                              value={customFlightForm.flight_name}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
                            <select
                              value={customFlightForm.destination}
                              onChange={(e) => {
                                const selectedAirport = e.target.value;
                                const airportInfo = airportData[selectedAirport];
                                setCustomFlightForm(prev => ({
                                  ...prev,
                                  destination: selectedAirport,
                                  sector_length_nm: airportInfo ? airportInfo.distance_nm : 4000,
                                  avg_altitude_ft: airportInfo ? airportInfo.altitude_ft : 35000
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            >
                              {Object.entries(airportData).map(([code, info]) => (
                                <option key={code} value={code}>
                                  {code} - {info.city} ({info.name})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Date</label>
                            <input
                              type="date"
                              value={customFlightForm.flight_date}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_date: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Hours</label>
                            <input
                              type="number"
                              value={customFlightForm.flight_hours}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_hours: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycles</label>
                            <input
                              type="number"
                              value={customFlightForm.cycles}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, cycles: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Altitude (ft)</label>
                            <input
                              type="number"
                              value={customFlightForm.avg_altitude_ft}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, avg_altitude_ft: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sector Length (nm)</label>
                            <input
                              type="number"
                              value={customFlightForm.sector_length_nm}
                              onChange={(e) => setCustomFlightForm(prev => ({ ...prev, sector_length_nm: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1B1C2A] text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={handleAddCustomFlight}
                            disabled={addingCustomFlight}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                          >
                            {addingCustomFlight ? (editingFlight ? 'Updating...' : 'Adding...') : (editingFlight ? 'Update Flight' : 'Add Flight')}
                          </button>
                          <button
                            onClick={() => {
                              setShowCustomFlightForm(false);
                              if (editingFlight) {
                                // Reset editingFlight in parent component
                                // This will be handled by the parent
                              }
                            }}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                <div className="space-y-4">
                  {predictions.map((pred, index) => {
                    const maxProb = Math.max(...pred.probabilities);
                    const riskColors = getRiskColor(maxProb);
                    return (
                        <div
                        key={index}
                        className={`relative rounded-xl p-4 border-l-4 transition-all hover:shadow-lg cursor-pointer ${
                          selectedFlight?.flight_id === pred.flight_id
                            ? `border-blue-500 bg-blue-50 dark:bg-blue-900/30`
                            : `border-gray-300 dark:border-gray-700 bg-white dark:bg-[#252634] hover:bg-gray-100 dark:hover:bg-gray-800`
                        }`}
                        onClick={() => setSelectedFlight(pred)}
                      >
                        <div className="absolute top-12 right-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editingFlightId === pred.flight_id) {
                                setEditingFlightId(null);
                              } else {
                                setEditingFlightId(pred.flight_id);
                                setCustomFlightForm({
                                  flight_name: pred.flight_id.split('_')[0],
                                  flight_hours: pred.input_data.flight_hours,
                                  cycles: pred.input_data.cycles,
                                  destination: pred.destination,
                                  flight_date: pred.is_custom ? pred.flight_date : pred.flight_id.split('_')[1],
                                  avg_altitude_ft: pred.input_data.avg_altitude_ft,
                                  sector_length_nm: pred.input_data.sector_length_nm,
                                });
                              }
                            }}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                            title="Edit flight"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlightToDelete(pred.flight_id);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                            title="Remove flight"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white text-lg">
                              {pred.flight_id.split('_')[0]} DEL to {pred.destination}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {pred.is_custom ? formatDate(pred.flight_date) : formatDate(pred.flight_id.split('_')[1])} • {formatFlightHours(pred.input_data.flight_hours)} • {pred.weather_data.is_extreme ? 'Extreme Weather' : 'Normal Conditions'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${riskColors.bg} text-white`}>
                              {getRiskLevel(maxProb)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getIssueTypeName(pred.predicted_class)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full ${riskColors.bg}`}
                            style={{ width: `${maxProb * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {(maxProb * 100).toFixed(1)}% risk probability
                        </div>

                        {/* Inline Edit Form */}
                        {editingFlightId === pred.flight_id && (
                          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#1B1C2A] rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Edit Flight Details</h4>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Name</label>
                                <input
                                  type="text"
                                  value={customFlightForm.flight_name}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_name: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                  placeholder="Flight name"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Hours</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={customFlightForm.flight_hours}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_hours: parseFloat(e.target.value) || 0 }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cycles</label>
                                <input
                                  type="number"
                                  value={customFlightForm.cycles}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, cycles: parseInt(e.target.value) || 1 }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
                                <select
                                  value={customFlightForm.destination}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, destination: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                >
                                  <option value="LHR">London (LHR)</option>
                                  <option value="JFK">New York (JFK)</option>
                                  <option value="DXB">Dubai (DXB)</option>
                                  <option value="SIN">Singapore (SIN)</option>
                                  <option value="CDG">Paris (CDG)</option>
                                  <option value="FRA">Frankfurt (FRA)</option>
                                  <option value="AMS">Amsterdam (AMS)</option>
                                  <option value="HKG">Hong Kong (HKG)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Flight Date</label>
                                <input
                                  type="date"
                                  value={customFlightForm.flight_date}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, flight_date: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Avg Altitude (ft)</label>
                                <input
                                  type="number"
                                  value={customFlightForm.avg_altitude_ft}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, avg_altitude_ft: parseFloat(e.target.value) || 35000 }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sector Length (nm)</label>
                                <input
                                  type="number"
                                  value={customFlightForm.sector_length_nm}
                                  onChange={(e) => setCustomFlightForm(prev => ({ ...prev, sector_length_nm: parseFloat(e.target.value) || 4000 }))}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-[#252634] text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  onUpdateFlight(customFlightForm, pred.flight_id);
                                  setEditingFlightId(null);
                                }}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                              >
                                Update Flight
                              </button>
                              <button
                                onClick={() => setEditingFlightId(null)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="col-span-8 p-6 overflow-y-auto">
                {selectedFlight ? (
                  <div className="bg-white dark:bg-[#252634] rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Flight Analysis: {selectedFlight.flight_id.split('_')[0]} DEL to {selectedFlight.destination}</h3>
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Risk Assessment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedFlight.probabilities.map((prob, i) => {
                          const colors = getRiskColor(prob);
                          return (
                            <div key={i} className={`p-3 rounded-lg transition-all bg-gray-50 dark:bg-[#1B1C2A]`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span>{getIssueTypeIcon(i)}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{getIssueTypeName(i)}</span>
                              </div>
                              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{(prob * 100).toFixed(1)}%</div>
                              <div className={`text-xs font-medium ${colors.text}`}>{getRiskLevel(prob)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">Maintenance Recommendations</h4>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-500 text-xl">💡</span>
                          <div>
                            <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Primary Recommendation</div>
                            <div className="text-blue-800 dark:text-blue-200">{selectedFlight.recommendation.recommendation}</div>
                          </div>
                        </div>
                        {selectedFlight.recommendation.recommended_part && (
                          <button onClick={() => onScheduleMaintenance(selectedFlight.recommendation.recommended_part)} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                            Schedule Maintenance for {selectedFlight.recommendation.recommended_part.replace(/_/g, ' ')}
                          </button>
                        )}
                      </div>
                      {selectedFlight.recommendation.modifiers && selectedFlight.recommendation.modifiers.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Additional Notes:</div>
                          {selectedFlight.recommendation.modifiers.map((modifier, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                              <span>⚠️</span>{modifier}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-[#252634] rounded-xl p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-4xl mb-4">✈️</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Flight</h3>
                    <p className="text-gray-600 dark:text-gray-400">Click on any flight from the list to view detailed analysis and recommendations.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrognosisOverlay;