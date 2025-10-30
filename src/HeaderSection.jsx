import React, { useState } from 'react';

const HeaderSection = () => {
  const [airline, setAirline] = useState('PrognosAir');
  const [tailStart, setTailStart] = useState('');
  const [tailEnd, setTailEnd] = useState('');
  const [airport, setAirport] = useState('LHR');

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 flex justify-between items-center w-[90%] max-w-5xl px-4 py-3 rounded-2xl bg-[#050B16]/90 backdrop-blur-md shadow-lg border border-white/10">

      {/* Left Section */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-[#0A0F1F] px-3 py-2 rounded-xl border border-white/10">
          <span className="text-sm text-gray-400">Airline</span>
          <select value={airline} onChange={(e) => setAirline(e.target.value)} className="bg-transparent text-white focus:outline-none">
            <option>PrognosAir</option>
            <option>Air India</option>
            <option>Etihad</option>
            <option>Qatar</option>
          </select>
        </div>

        <div className="flex items-center bg-[#0A0F1F] px-3 py-2 rounded-xl border border-white/10 space-x-2">
          <input type="text" placeholder="Tail start" value={tailStart} onChange={(e) => setTailStart(e.target.value)} className="bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none w-20" />
          <span className="text-gray-500">→</span>
          <input type="text" placeholder="Tail end" value={tailEnd} onChange={(e) => setTailEnd(e.target.value)} className="bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none w-20" />
        </div>

        <button className="bg-sky-600 hover:bg-sky-500 px-4 py-2 rounded-xl text-sm font-semibold transition">
          Load
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 bg-[#0A0F1F] px-4 py-2 rounded-xl border border-white/10">
        <span className="text-sm text-gray-400">Airport</span>
        <select value={airport} onChange={(e) => setAirport(e.target.value)} className="bg-transparent text-white focus:outline-none">
          <option>LHR</option>
          <option>DXB</option>
          <option>DEL</option>
          <option>DOH</option>
        </select>
        <span className="text-sm text-white border-l border-white/10 pl-3">12°</span>
        <span className="text-gray-400 text-sm">Light rain</span>
      </div>

    </div>
  );
};

export default HeaderSection;
