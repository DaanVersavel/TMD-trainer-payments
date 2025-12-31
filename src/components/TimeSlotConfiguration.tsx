import type { TimeSlotConfig } from '../types';

interface TimeSlotConfigurationProps {
  timeSlots: string[];
  sessionCounts: Record<string, number>;
  configs: TimeSlotConfig[];
  onConfigChange: (configs: TimeSlotConfig[]) => void;
  disabled?: boolean;
}

export function TimeSlotConfiguration({
  timeSlots,
  sessionCounts,
  configs,
  onConfigChange,
  disabled = false,
}: TimeSlotConfigurationProps) {
  const handleDurationChange = (timeSlot: string, value: string) => {
    const duration = value === '' ? 0 : parseFloat(value);
    
    const existingIndex = configs.findIndex((c) => c.timeSlot === timeSlot);
    const newConfigs = [...configs];
    
    if (existingIndex >= 0) {
      newConfigs[existingIndex] = { timeSlot, duration };
    } else {
      newConfigs.push({ timeSlot, duration });
    }
    
    onConfigChange(newConfigs);
  };

  const getDuration = (timeSlot: string): number | '' => {
    const config = configs.find((c) => c.timeSlot === timeSlot);
    return config?.duration ?? '';
  };

  if (timeSlots.length === 0) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-400">
          No time slots detected. Please upload a valid Excel file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          Time Slot Durations
        </h3>
        <span className="text-xs text-gray-500">
          {timeSlots.length} time slot{timeSlots.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      <div className="space-y-3">
        {timeSlots.map((timeSlot) => (
          <div
            key={timeSlot}
            className="flex items-center gap-4 p-3 bg-dark-800/50 border border-dark-700 rounded-lg"
          >
            {/* Time Slot Display */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <span className="text-lg">⏰</span>
              <div>
                <p className="font-medium text-gray-100">{timeSlot}</p>
                <p className="text-xs text-gray-500">
                  {sessionCounts[timeSlot] || 0} session{(sessionCounts[timeSlot] || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Duration Input */}
            <div className="flex items-center gap-2 flex-1">
              <label
                htmlFor={`duration-${timeSlot}`}
                className="text-sm text-gray-400"
              >
                Duration:
              </label>
              <input
                type="number"
                id={`duration-${timeSlot}`}
                value={getDuration(timeSlot)}
                onChange={(e) => handleDurationChange(timeSlot, e.target.value)}
                placeholder="e.g., 2"
                min="0"
                step="0.5"
                disabled={disabled}
                className={`
                  w-24 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded-lg text-center
                  text-gray-100 placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
              <span className="text-sm text-gray-500">hours</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 italic">
        💡 Tip: These durations will be saved for future use with this group.
      </p>
    </div>
  );
}
