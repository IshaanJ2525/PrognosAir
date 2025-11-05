import React from 'react';

const Overlay = ({ part, onClose, theme }) => {
  if (!part) return null;

  const { name, usedHours, totalHours, condition, lastCheck, nextService } = part;
  const usage = (usedHours / totalHours) * 100;

  return (
    <div className={`fixed top-20 right-6 z-50 p-2 `}>
      <div className={`relative w-[350px] ${theme === 'dark' ? 'bg-[#1B1C2A] text-white' : 'bg-white text-black'} border ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'} shadow-lg rounded-2xl overflow-hidden`}>
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`}>
          <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{name.replace(/_/g, ' ')}</h2>
          <button
            onClick={onClose}
            className={`${theme === 'dark' ? 'bg-[#007AFF] text-white' : 'bg-[#007AFF] text-white'} px-4 py-1.5 rounded-2xl hover:bg-[#0056CC] transition`}
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${condition === 'Attention Required' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              {condition}
            </span>
          </div>

          <div className="mb-4">
            <div className={`flex justify-between text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
              <span>Usage</span>
              <span>{usage.toFixed(0)}%</span>
            </div>
            <div className={`w-full rounded-full h-2.5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <div className={`h-2.5 rounded-full ${usage > 90 ? 'bg-red-500' : usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${usage}%` }}></div>
            </div>
            <div className={`flex justify-between text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{usedHours}h used</span>
              <span>{totalHours}h total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Last Check</p>
              <p className={theme === 'dark' ? 'text-white' : 'text-black'}>{lastCheck}</p>
            </div>
            <div>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Next Service</p>
              <p className={theme === 'dark' ? 'text-white' : 'text-black'}>{nextService}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;