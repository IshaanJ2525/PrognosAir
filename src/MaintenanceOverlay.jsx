import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, Plus } from 'lucide-react';
import { ScrollArea } from './components/ui/scroll-area';

const MaintenanceOverlay = ({ onClose, theme, maintenanceTasks, currentMaintenanceTasks, pastMaintenanceTasks, onAddTask, onMoveToCurrent, onCompleteTask, prognosisPart }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    part: '',
    type: 'Inspection',
    date: '',
    technician: 'John Smith'
  });



  useEffect(() => {
    if (prognosisPart) {
      setNewTask(prev => ({ ...prev, part: prognosisPart }));
      setActiveTab('upcoming');
      setShowForm(true);
    }
  }, [prognosisPart]);

  const technicians = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson'];

  const handleAddTask = () => {
    if (newTask.part && newTask.date) {
      onAddTask({
        id: Date.now(),
        ...newTask,
        status: 'Scheduled',
        duration: '8 hours' // Default duration
      });
      setNewTask({ part: '', type: 'Inspection', date: '', technician: 'John Smith' });
      setShowForm(false);
    }
  };

  const getRecordsForTab = () => {
    switch (activeTab) {
      case 'past':
        return pastMaintenanceTasks;
      case 'current':
        return currentMaintenanceTasks;
      case 'upcoming':
        return maintenanceTasks;
      default:
        return maintenanceTasks;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1B1C2A]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#007AFF]/20">
              <Wrench className="h-5 w-5 text-[#007AFF]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Maintenance Records</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-[#334155] p-2 transition"
          >
            <X className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-[#0A0F1F] p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === 'upcoming' ? 'bg-[#007AFF] text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === 'current' ? 'bg-[#007AFF] text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                activeTab === 'past' ? 'bg-[#007AFF] text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Past
            </button>
          </div>

          {activeTab === 'upcoming' && (
            <div className="mb-4">
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 text-sm font-medium text-[#007AFF]">
                <Plus size={16} /> {showForm ? 'Cancel' : 'Schedule New Maintenance'}
              </button>
              {showForm && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0A0F1F] rounded-xl border border-gray-200 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Part Name" value={newTask.part} onChange={e => setNewTask({...newTask, part: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-[#1B1C2A] border border-gray-300 dark:border-gray-600" />
                    <input type="date" value={newTask.date} onChange={e => setNewTask({...newTask, date: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-[#1B1C2A] border border-gray-300 dark:border-gray-600" />
                    <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-[#1B1C2A] border border-gray-300 dark:border-gray-600">
                      <option>Inspection</option>
                      <option>Replacement</option>
                      <option>New Part</option>
                      <option>Repair</option>
                      <option>Service</option>
                    </select>
                    <select value={newTask.technician} onChange={e => setNewTask({...newTask, technician: e.target.value})} className="p-2 rounded-lg bg-white dark:bg-[#1B1C2A] border border-gray-300 dark:border-gray-600">
                      {technicians.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={handleAddTask} className="mt-4 w-full py-2 bg-[#007AFF] text-white rounded-lg font-semibold">Add Task</button>
                </div>
              )}
            </div>
          )}

          <ScrollArea className="h-[350px]">
            <div className="space-y-3">
              {getRecordsForTab().map((record, index) => (
                <MaintenanceCard key={index} record={record} showProgress={activeTab === 'current'} onMoveToCurrent={onMoveToCurrent} onCompleteTask={onCompleteTask} activeTab={activeTab} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

const MaintenanceCard = ({ record, showProgress, onMoveToCurrent, onCompleteTask, activeTab }) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0A0F1F] border border-gray-200 dark:border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{record.type} - {record.part}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          record.status === 'Completed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-500' :
          record.status === 'In Progress' ? 'bg-blue-100 dark:bg-[#007AFF]/20 text-blue-700 dark:text-[#007AFF]' :
          'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-500'
        }`}>
          {record.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Duration: {record.duration}</span>
        <span>•</span>
        <span>Tech: {record.technician}</span>
      </div>
      {showProgress && record.progress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{record.progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#007AFF] to-[#0056CC] transition-all duration-300"
              style={{ width: `${record.progress}%` }}
            />
          </div>
        </div>
      )}
      {activeTab === 'upcoming' && (
        <button onClick={() => onMoveToCurrent(record)} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
          Start Service
        </button>
      )}
      {activeTab === 'current' && (
        <button onClick={() => onCompleteTask(record)} className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
          Mark as Completed
        </button>
      )}
    </div>
  );
};

export default MaintenanceOverlay;
