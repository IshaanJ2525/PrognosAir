
import React from 'react';
import { partAliases } from './partAliases';

const Overlay = ({ part, onClose }) => {
  if (!part) return null;

  const getDisplayName = (name) => {
    return partAliases[name] || name;
  };

  const usage = Math.round((part.usedHours / part.totalHours) * 100);

  return (
    <div id="overlay"
      className="fixed top-1/2 -translate-y-1/2 right-6 w-96 bg-[#050B16]/95 backdrop-blur-md border border-white/10 shadow-2xl p-6 rounded-2xl flex flex-col transition-all duration-300">

      <div className="flex justify-between items-center mb-3">
        <h2 id="partName" className="text-2xl font-semibold">{getDisplayName(part.name)}</h2>
      </div>

      <p id="statusText" className={`text-sm ${part.condition === "Attention Required" ? 'text-red-400' : 'text-green-400'} mb-4 flex items-center gap-2`}>
        <span className={`w-2 h-2 ${part.condition === "Attention Required" ? 'bg-red-500' : 'bg-green-500'} rounded-full inline-block`}></span>
        Status: {part.condition}
      </p>

      <div className="bg-[#0A0F1F] border border-white/10 rounded-2xl p-4 mb-5">
        <p className="text-sm text-gray-300 mb-2">Component Usage</p>
        <div className="relative w-full h-3 bg-[#1E293B] rounded-full overflow-hidden">
          <div id="usageBar" className={`absolute top-0 left-0 h-full ${usage > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${usage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span id="usageUsed">{part.usedHours}h used</span>
          <span id="usageTotal">{part.totalHours}h total</span>
        </div>
        <p id="usagePercent" className="text-right text-sky-400 font-semibold mt-1">{usage}%</p>
      </div>

      <div className="bg-[#0A0F1F] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0F1629]/50 text-gray-400 uppercase text-xs">
            <tr><th className="text-left px-4 py-2">Metric</th><th className="text-left px-4 py-2">Value</th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/5">
              <td className="px-4 py-2 text-gray-400">Condition</td>
              <td id="condition" className={`px-4 py-2 font-semibold ${part.condition === "Attention Required" ? 'text-red-400' : 'text-green-400'}`}>{part.condition}</td>
            </tr>
            <tr className="border-t border-white/5">
              <td className="px-4 py-2 text-gray-400">Last Check</td>
              <td id="lastCheck" className="px-4 py-2">{part.lastCheck}</td>
            </tr>
            <tr className="border-t border-white/5">
              <td className="px-4 py-2 text-gray-400">Flight Hours</td>
              <td id="flightHours" className="px-4 py-2">{part.usedHours}h</td>
            </tr>
            <tr className="border-t border-white/5">
              <td className="px-4 py-2 text-gray-400">Next Service</td>
              <td id="nextService" className="px-4 py-2">{part.nextService}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onClose} className="bg-[#1E293B] px-5 py-2 rounded-xl hover:bg-[#334155] transition">Close</button>
      </div>
    </div>
  );
};

export default Overlay;
