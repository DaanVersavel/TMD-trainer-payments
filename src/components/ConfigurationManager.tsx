import { useState } from 'react';
import type { GroupConfig } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface ConfigurationManagerProps {
  configs: GroupConfig[];
  onDeleteConfig: (groupName: string) => void;
  onClose: () => void;
}

export function ConfigurationManager({
  configs,
  onDeleteConfig,
  onClose,
}: ConfigurationManagerProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const handleDelete = (groupName: string) => {
    onDeleteConfig(groupName);
    setDeleteConfirmation(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="bg-dark-900 rounded-lg border border-dark-700 shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col animate-slideUp">
          {/* Header */}
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                ⚙️ Saved Configurations
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Manage your saved group configurations
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {configs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">📭 No saved configurations</p>
                <p className="text-gray-600 text-sm mt-2">
                  Configurations are automatically saved when you process a group
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {configs.map((config) => (
                  <div
                    key={config.groupName}
                    className="bg-dark-800 rounded-lg border border-dark-700 p-4 hover:border-dark-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-100 text-lg mb-2">
                          {config.groupName}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500">Price per hour:</span>
                            <span className="text-green-400 font-medium ml-2">
                              €{config.pricePerHour.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Time slots:</span>
                            <span className="text-blue-400 font-medium ml-2">
                              {config.timeSlots.length}
                            </span>
                          </div>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Time Slot Durations:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {config.timeSlots.map((slot) => (
                              <div
                                key={slot.timeSlot}
                                className="bg-dark-900 px-3 py-1.5 rounded text-sm flex items-center justify-between"
                              >
                                <span className="text-gray-400">{slot.timeSlot}</span>
                                <span className="text-gray-200 font-medium">
                                  {slot.duration}h
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmation(config.groupName)}
                        className="text-red-400 hover:text-red-300 px-3 py-2 rounded hover:bg-red-500/10 transition-colors text-sm font-medium"
                        title="Delete configuration"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-dark-800/50 border-t border-dark-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation !== null}
        title="Delete Configuration"
        message={`Are you sure you want to delete the saved configuration for "${deleteConfirmation}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => deleteConfirmation && handleDelete(deleteConfirmation)}
        onCancel={() => setDeleteConfirmation(null)}
      />
    </>
  );
}
