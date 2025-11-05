import { X, Clock, Plane } from 'lucide-react';
import { ScrollArea } from './components/ui/scroll-area';

const TimetableOverlay = ({ onClose, theme }) => {
  const flights = [
    {
      registration: '9V-SCA',
      flight: 'SQ285',
      departure: '08:30',
      arrival: '14:45',
      route: 'SIN → LHR',
      status: 'On Time'
    },
    {
      registration: '9V-SCB',
      flight: 'SQ22',
      departure: '10:15',
      arrival: '18:30',
      route: 'SIN → SFO',
      status: 'Boarding'
    },
    {
      registration: '9V-SMA',
      flight: 'SQ12',
      departure: '12:00',
      arrival: '19:15',
      route: 'SIN → JFK',
      status: 'Delayed'
    },
    {
      registration: '9V-SMB',
      flight: 'SQ308',
      departure: '15:30',
      arrival: '20:45',
      route: 'SIN → SYD',
      status: 'On Time'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-[#1B1C2A]/95 backdrop-blur-2xl border border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#007AFF]/20">
              <Clock className="h-5 w-5 text-[#007AFF]" />
            </div>
            <h2 className="text-2xl font-semibold text-white">Flight Timetable</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-[#334155] p-2 transition"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {flights.map((flight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-[#0A0F1F] border border-white/10 hover:bg-[#1E293B] transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Plane className="h-4 w-4 text-[#007AFF] rotate-45" />
                      <span className="font-semibold text-white">{flight.flight}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">{flight.registration}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      flight.status === 'On Time' ? 'bg-green-500/20 text-green-500' :
                      flight.status === 'Boarding' ? 'bg-[#007AFF]/20 text-[#007AFF]' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {flight.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{flight.route}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dep: {flight.departure} • Arr: {flight.arrival}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default TimetableOverlay;
