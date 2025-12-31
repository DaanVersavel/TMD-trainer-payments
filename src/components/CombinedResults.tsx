import { useState } from 'react';
import type { CombinedResults as CombinedResultsType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface CombinedResultsProps {
  results: CombinedResultsType;
  onProcessAnother: () => void;
  onDeleteGroup: (groupName: string) => void;
  onEditGroup: (groupName: string) => void;
  onStartOver: () => void;
}

export function CombinedResults({
  results,
  onProcessAnother,
  onDeleteGroup,
  onEditGroup,
  onStartOver,
}: CombinedResultsProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [startOverConfirmation, setStartOverConfirmation] = useState(false);

  const sortedTrainers = Object.entries(results.trainerTotals).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const handleDelete = (groupName: string) => {
    onDeleteGroup(groupName);
    setDeleteConfirmation(null);
  };

  const handleStartOver = () => {
    onStartOver();
    setStartOverConfirmation(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-dark-900 rounded-lg border border-dark-700 p-4">
          <h2 className="text-xl font-bold text-gray-100">
            Combined Results - All Groups
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Groups Processed: {results.groups.map((g) => g.groupName).join(', ')}
          </p>
        </div>

        {/* Total Payments per Trainer */}
        <div className="bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
          <div className="px-4 py-3 bg-dark-800 border-b border-dark-700">
            <h3 className="font-medium text-gray-100">💰 Total Payments per Trainer</h3>
          </div>

          {sortedTrainers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No trainer payments to display
            </div>
          ) : (
            <div className="divide-y divide-dark-700">
              {sortedTrainers.map(([name, totals]) => (
                <div
                  key={name}
                  className="px-4 py-3 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-100">{name}</span>
                  <div className="flex items-center gap-6 text-right">
                    <span className="text-gray-400 min-w-[80px]">
                      {totals.hours.toFixed(2)}h
                    </span>
                    <span className="font-semibold text-green-400 min-w-[100px]">
                      €{totals.payment.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Grand Totals Row */}
              <div className="px-4 py-3 bg-blue-500/10 flex items-center justify-between font-bold">
                <span className="text-blue-400">GRAND TOTAL</span>
                <div className="flex items-center gap-6 text-right">
                  <span className="text-blue-300 min-w-[80px]">
                    {results.grandTotalHours.toFixed(2)}h
                  </span>
                  <span className="text-blue-300 min-w-[100px]">
                    €{results.grandTotalPayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown by Group */}
        <div className="bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
          <div className="px-4 py-3 bg-dark-800 border-b border-dark-700">
            <h3 className="font-medium text-gray-100">📊 Breakdown by Group</h3>
          </div>

          <div className="divide-y divide-dark-700">
            {results.groups.map((group) => (
              <div
                key={group.groupName}
                className="px-4 py-3 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-100">{group.groupName}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({group.sessionCount} sessions)
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{group.totalHours.toFixed(2)}h</span>
                  <span className="font-semibold text-green-400">
                    €{group.totalPayment.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEditGroup(group.groupName)}
                      className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmation(group.groupName)}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onProcessAnother}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Process Another Group
          </button>
          <button
            type="button"
            onClick={() => setStartOverConfirmation(true)}
            className="px-4 py-2.5 bg-dark-800 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors font-medium"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Delete Group Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmation !== null}
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteConfirmation}" from the results? This will recalculate all totals.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => deleteConfirmation && handleDelete(deleteConfirmation)}
        onCancel={() => setDeleteConfirmation(null)}
      />

      {/* Start Over Confirmation */}
      <ConfirmationModal
        isOpen={startOverConfirmation}
        title="Start Over"
        message="This will clear all processed groups and reset the application. Are you sure you want to continue?"
        confirmText="Start Over"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleStartOver}
        onCancel={() => setStartOverConfirmation(false)}
      />
    </>
  );
}
