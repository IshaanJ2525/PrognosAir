import { X, Settings as SettingsIcon, Palette, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const SettingsOverlay = ({ onClose, theme, onThemeChange }) => {
  const [selectedTheme, setSelectedTheme] = useState(theme);

  const handleApply = () => {
    onThemeChange(selectedTheme);
    onClose();
  };

  const uiStyles = [
    { value: 'frosted', label: 'Frosted Glass' },
    { value: 'solid', label: 'Solid' },
    { value: 'minimal', label: 'Minimal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 border-4 border-red-500">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-[#1B1C2A]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-[0_0_8px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-[#007AFF]/20">
              <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-[#007AFF]" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 dark:hover:bg-[#334155] p-2 transition"
          >
            <X className="h-5 w-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {selectedTheme === 'dark' ? <Moon className="h-4 w-4 text-blue-600 dark:text-[#007AFF]" /> : <Sun className="h-4 w-4 text-blue-600 dark:text-[#007AFF]" />}
              <label className="text-base font-semibold text-gray-900 dark:text-white">Theme</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTheme('light')}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all ${
                  selectedTheme === 'light'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#0A0F1F] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#334155]'
                }`}
              >
                <Sun className="h-4 w-4 inline mr-2" />
                Light
              </button>
              <button
                onClick={() => setSelectedTheme('dark')}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all ${
                  selectedTheme === 'dark'
                    ? 'bg-gradient-to-r from-[#007AFF] to-[#0056CC] text-white'
                    : 'bg-gray-100 dark:bg-[#0A0F1F] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#334155]'
                }`}
              >
                <Moon className="h-4 w-4 inline mr-2" />
                Dark
              </button>
            </div>
          </div>

          {/* UI Style Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-blue-600 dark:text-[#007AFF]" />
              <label className="text-base font-semibold text-gray-900 dark:text-white">UI Style</label>
            </div>
            <select
              defaultValue="frosted"
              className="w-full bg-gray-50 dark:bg-[#0A0F1F] border border-gray-300 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#007AFF]"
            >
              {uiStyles.map((style) => (
                <option key={style.value} value={style.value} className="bg-white dark:bg-[#0A0F1F] text-gray-900 dark:text-white">
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          {/* Apply Button */}
          <button
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 dark:from-[#007AFF] dark:to-[#0056CC] text-white font-semibold hover:opacity-90 transition-opacity"
            onClick={handleApply}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
