import React, { useState, useRef, useEffect } from "react";

const optionsAirline = [
  "Singapore",
  "Qantas",
];
const optionsAirport = ["LHR", "CDG", "DXB", "DEL", "DOH"];

const Dropdown = ({ options, selected, onChange, width = 110, theme }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block w-[${width}px]`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full ${theme === 'dark' ? 'bg-[#252634] text-white' : 'bg-gray-100 text-gray-900'} text-sm font-medium rounded-full py-1.5 px-4 flex justify-between items-center cursor-pointer focus:outline-none`}
      >
        {selected}
        <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} select-none ml-2`}>▼</span>
      </button>
      {open && (
        <ul className={`absolute z-50 mt-1 ${theme === 'dark' ? 'bg-[#252634] text-white' : 'bg-white text-gray-900'} rounded-xl shadow-lg w-full max-h-48 overflow-auto text-sm py-1 custom-scrollbar focus:outline-none`}>
          {options.map((o) => (
            <li
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 ${theme === 'dark' ? 'hover:bg-[#007AFF]' : 'hover:bg-blue-100'} ${
                o === selected ? (theme === 'dark' ? 'bg-[#007AFF]/70' : 'bg-blue-200') : ''
              }`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const HeaderSection = ({ onHazardsClick, onTimetableClick, onSettingsClick, onMaintenanceClick, onModelChange, theme }) => {
  const [airline, setAirline] = useState(optionsAirline[0]);
  const [tailStart, setTailStart] = useState("");
  const [tailEnd, setTailEnd] = useState("");
  const [airport, setAirport] = useState(optionsAirport[0]);

  return (
    <>
      {/* Container for left vertical buttons */}
      <div className="fixed top-40 left-6 flex flex-col space-y-4 z-50">
        <button
          onClick={onHazardsClick}
          className="bg-white dark:bg-[#1B1C2A] hover:bg-blue-500 dark:hover:bg-[#007AFF] transition text-gray-900 dark:text-white rounded-xl p-3 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          title="Hazard"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onMaintenanceClick}
          className="bg-white dark:bg-[#1B1C2A] hover:bg-blue-500 dark:hover:bg-[#007AFF] transition text-gray-900 dark:text-white rounded-xl p-3 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          title="Maintenance"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </button>
        <button
          onClick={onTimetableClick}
          className="bg-white dark:bg-[#1B1C2A] hover:bg-blue-500 dark:hover:bg-[#007AFF] transition text-gray-900 dark:text-white rounded-xl p-3 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          title="Flight Timetable"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={onSettingsClick}
          className="bg-white dark:bg-[#1B1C2A] hover:bg-blue-500 dark:hover:bg-[#007AFF] transition text-gray-900 dark:text-white rounded-xl p-3 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
          title="Settings"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* LEFT BAR */}
      <div className="fixed top-6 left-8 flex items-center space-x-6 bg-white dark:bg-[#1B1C2A] rounded-full px-2 py-2 shadow-[0_0_8px_rgba(0,0,0,0.4)] z-50 max-w-[700px] w-auto">
        <span className="text-gray-700 dark:text-gray-300 text-sm select-none ml-4">Airline</span>
        <Dropdown options={optionsAirline} selected={airline} onChange={setAirline} width={110} theme={theme} />
        <span className="text-gray-400 dark:text-gray-500 select-none">|</span>
        <input
          type="text"
          placeholder="Tail start"
          value={tailStart}
          onChange={(e) => setTailStart(e.target.value)}
          spellCheck="false"
          className="bg-gray-100 dark:bg-[#252634] text-gray-900 dark:text-gray-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm rounded-full px-4 py-1.5 focus:outline-none w-[90px]"
        />
        <span className="text-gray-900 dark:text-white font-semibold select-none">→</span>
        <input
          type="text"
          placeholder="Tail end"
          value={tailEnd}
          onChange={(e) => setTailEnd(e.target.value)}
          spellCheck="false"
          className="bg-gray-100 dark:bg-[#252634] text-gray-900 dark:text-gray-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm rounded-full px-4 py-1.5 focus:outline-none w-[90px]"
        />
        <button onClick={() => onModelChange(`${tailStart}_${tailEnd}`)} className="ml-4 bg-blue-500 dark:bg-[#007AFF] hover:bg-blue-600 dark:hover:bg-[#005FCC] transition text-white rounded-full px-6 py-1.5 text-sm font-semibold">
          Load
        </button>
      </div>

      {/* RIGHT BAR */}
      <div className="fixed top-6 right-8 flex items-center space-x-6 bg-white dark:bg-[#1B1C2A] rounded-full px-6 py-2 shadow-[0_0_8px_rgba(0,0,0,0.4)] z-50 max-w-[380px] w-auto">
        <span className="text-gray-700 dark:text-gray-300 text-sm select-none">Airport</span>
        <Dropdown options={optionsAirport} selected={airport} onChange={setAirport} width={70} theme={theme} />
        <span className="text-gray-400 dark:text-gray-500 select-none">|</span>
        <span className="text-gray-900 dark:text-white font-semibold text-sm select-none">12°</span>
        <span className="text-gray-600 dark:text-gray-400 text-sm select-none">Light rain</span>
      </div>
    </>
  );
};

export default HeaderSection;