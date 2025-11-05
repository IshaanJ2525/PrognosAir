import { AlertTriangle } from 'lucide-react';

const HazardsOverlay = ({ onClose, theme }) => {
  const hazards = [
    {
      severity: 'high',
      title: 'Hydraulic System Pressure Low',
      part: 'Left Wing Actuator',
      date: '2024-01-15',
      status: 'Under Review'
    },
    {
      severity: 'medium',
      title: 'Engine Temperature Fluctuation',
      part: 'Engine 2 Sensor',
      date: '2024-01-14',
      status: 'Resolved'
    },
    {
      severity: 'low',
      title: 'Minor Corrosion Detected',
      part: 'Fuselage Panel 47B',
      date: '2024-01-12',
      status: 'Scheduled'
    },
  ];

  return (
    <div className="fixed top-20 left-20 z-50 p-4">
      <div className="relative w-96 bg-[#1B1C2A] border border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#007AFF]/20">
              <AlertTriangle className="h-5 w-5 text-[#007AFF]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Hazards & Alerts</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-[#007AFF] text-white px-4 py-1.5 rounded-2xl hover:bg-[#0056CC] transition"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          <div className="h-[400px] overflow-y-auto">
            <div className="space-y-3">
              {hazards.map((hazard, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-[#0A0F1F] border border-white/10 hover:bg-[#1E293B] transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${
                      hazard.severity === 'high' ? 'bg-red-500/20' :
                      hazard.severity === 'medium' ? 'bg-[#007AFF]/20' :
                      'bg-green-500/20'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        hazard.severity === 'high' ? 'text-red-500' :
                        hazard.severity === 'medium' ? 'text-[#007AFF]' :
                        'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{hazard.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          hazard.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                          hazard.severity === 'medium' ? 'bg-[#007AFF]/20 text-[#007AFF]' :
                          'bg-green-500/20 text-green-500'
                        }`}>
                          {hazard.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{hazard.part}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{hazard.date}</span>
                        <span>•</span>
                        <span>{hazard.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HazardsOverlay;
