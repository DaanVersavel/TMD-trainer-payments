import { useState, useEffect } from 'react';
import type { CombinedResults, TimeSlotConfig } from '../types';

interface EditGroupModalProps {
  groupName: string;
  results: CombinedResults;
  onClose: () => void;
  onSave: (groupName: string, pricePerHour: number, timeSlotConfigs: TimeSlotConfig[]) => void;
}

export function EditGroupModal({
  groupName,
  results,
  onClose,
  onSave,
}: EditGroupModalProps) {
  const group = results.groups.find((g) => g.groupName === groupName);
  
  const [pricePerHour, setPricePerHour] = useState<number>(group?.pricePerHour ?? 0);
  const [timeSlotConfigs, setTimeSlotConfigs] = useState<TimeSlotConfig[]>([]);

  // Extract time slots from trainer hours breakdown
  useEffect(() => {
    if (group) {
      const timeSlots = new Set<string>();
      group.trainerHours.forEach((trainer) => {
        Object.keys(trainer.hoursByTimeSlot).forEach((slot) => timeSlots.add(slot));
      });
      
      // Initialize with empty durations (user needs to re-enter)
      const configs: TimeSlotConfig[] = Array.from(timeSlots).map((slot) => ({
        timeSlot: slot,
        duration: 0,
      }));
      setTimeSlotConfigs(configs);
    }
  }, [group]);

  if (!group) {
    return null;
  }

  const handleDurationChange = (timeSlot: string, value: string) => {
    const duration = value === '' ? 0 : parseFloat(value);
    setTimeSlotConfigs((prev) =>
      prev.map((c) => (c.timeSlot === timeSlot ? { ...c, duration } : c))
    );
  };

  const handleSave = () => {
    if (pricePerHour <= 0) {
      alert('Price per hour must be greater than 0');
      return;
    }
    
    const invalidSlot = timeSlotConfigs.find((c) => c.duration <= 0);
    if (invalidSlot) {
      alert(`Duration must be greater than 0 for time slot ${invalidSlot.timeSlot}`);
      return;
    }

    onSave(groupName, pricePerHour, timeSlotConfigs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-dark-900 border border-dark-700 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="text-lg font-semibold text-gray-100">
            Edit Group - {groupName}
          </h2>
          <p className="text-sm text-yellow-400 mt-1">
            ⚠️ This will recalculate all payments for this group
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Price Input */}
          <div>
            <label
              htmlFor="editPrice"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Price per Hour (€)
            </label>
            <input
              type="number"
              id="editPrice"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Time Slot Durations */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Slot Durations
            </label>
            <div className="space-y-2">
              {timeSlotConfigs.map((config) => (
                <div
                  key={config.timeSlot}
                  className="flex items-center gap-3 bg-dark-800/50 p-2 rounded border border-dark-700"
                >
                  <span className="text-gray-300 min-w-[60px]">⏰ {config.timeSlot}</span>
                  <input
                    type="number"
                    value={config.duration || ''}
                    onChange={(e) => handleDurationChange(config.timeSlot, e.target.value)}
                    placeholder="hours"
                    min="0"
                    step="0.5"
                    className="flex-1 px-3 py-1.5 bg-dark-800 border border-dark-600 rounded text-gray-100 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500 text-sm">hours</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-dark-700 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-dark-800 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}
