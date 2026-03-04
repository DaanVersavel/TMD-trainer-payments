import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import type { CombinedResults as CombinedResultsType } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface CombinedResultsProps {
  results: CombinedResultsType;
  onProcessAnother: () => void;
  onDeleteGroup: (groupName: string) => void;
  onEditGroup: (groupName: string) => void;
  onStartOver: () => void;
  onTrainerAdjustment: (trainerName: string, amount: number) => void;
}

export function CombinedResults({
  results,
  onProcessAnother,
  onDeleteGroup,
  onEditGroup,
  onStartOver,
  onTrainerAdjustment,
}: CombinedResultsProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [startOverConfirmation, setStartOverConfirmation] = useState(false);
  const sortedTrainers = Object.entries(results.trainerTotals).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const handleDownloadImage = useCallback(async () => {
    // Build a minimal off-screen element with just names + totals
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:0;padding:24px;background:#0f1117;color:#f3f4f6;font-family:system-ui,sans-serif;min-width:400px;';

    const title = document.createElement('h2');
    title.style.cssText = 'font-size:18px;font-weight:bold;margin:0 0 16px 0;color:#f3f4f6;';
    title.textContent = `Trainer Payments — ${results.groups.map(g => g.groupName).join(', ')}`;
    container.appendChild(title);

    for (const [name, totals] of sortedTrainers) {
      const adjustment = results.trainerAdjustments[name] || 0;
      const total = totals.payment + adjustment;

      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2a2d35;';

      const nameEl = document.createElement('span');
      nameEl.style.cssText = 'font-weight:500;color:#f3f4f6;';
      nameEl.textContent = name;

      const amountEl = document.createElement('span');
      amountEl.style.cssText = 'font-weight:600;color:#4ade80;';
      amountEl.textContent = `€${total.toFixed(2)}`;

      row.appendChild(nameEl);
      row.appendChild(amountEl);
      container.appendChild(row);
    }

    // Grand total
    const totalRow = document.createElement('div');
    totalRow.style.cssText = 'display:flex;justify-content:space-between;padding:12px 0 0 0;margin-top:4px;font-weight:bold;';

    const totalLabel = document.createElement('span');
    totalLabel.style.cssText = 'color:#60a5fa;';
    totalLabel.textContent = 'TOTAL';

    const totalAmount = document.createElement('span');
    totalAmount.style.cssText = 'color:#93c5fd;';
    totalAmount.textContent = `€${results.grandTotalPayment.toFixed(2)}`;

    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalAmount);
    container.appendChild(totalRow);

    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#0f1117',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `trainer-payments-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      document.body.removeChild(container);
    }
  }, [results, sortedTrainers]);

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
              {sortedTrainers.map(([name, totals]) => {
                const adjustment = results.trainerAdjustments[name] || 0;
                const adjustedPayment = totals.payment + adjustment;
                return (
                  <div
                    key={name}
                    className="px-4 py-3 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
                  >
                    <span className="font-medium text-gray-100">{name}</span>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-gray-400 min-w-[80px]">
                        {totals.hours.toFixed(2)}h
                      </span>
                      <span className="text-gray-500 min-w-[80px]">
                        €{totals.payment.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 min-w-[100px]">
                        <span className="text-gray-500 text-sm">+/-</span>
                        <input
                          type="number"
                          step="0.01"
                          value={adjustment || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            if (!isNaN(val)) onTrainerAdjustment(name, val);
                          }}
                          className="w-20 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-sm text-gray-200 text-right focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <span className="font-semibold text-green-400 min-w-[100px]">
                        €{adjustedPayment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Grand Totals Row */}
              {(() => {
                const totalAdjustments = Object.values(results.trainerAdjustments).reduce(
                  (sum, a) => sum + a,
                  0
                );
                return (
                  <div className="px-4 py-3 bg-blue-500/10 flex items-center justify-between font-bold">
                    <span className="text-blue-400">GRAND TOTAL</span>
                    <div className="flex items-center gap-4 text-right">
                      <span className="text-blue-300 min-w-[80px]">
                        {results.grandTotalHours.toFixed(2)}h
                      </span>
                      <span className="text-blue-300/60 min-w-[80px]">
                        €{(results.grandTotalPayment - totalAdjustments).toFixed(2)}
                      </span>
                      <span className={`min-w-[100px] text-sm ${totalAdjustments !== 0 ? 'text-yellow-400' : 'text-blue-300/40'}`}>
                        {totalAdjustments !== 0 ? `${totalAdjustments > 0 ? '+' : ''}€${totalAdjustments.toFixed(2)}` : ''}
                      </span>
                      <span className="text-blue-300 min-w-[100px]">
                        €{results.grandTotalPayment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
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
            onClick={handleDownloadImage}
            className="px-4 py-2.5 bg-dark-800 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors font-medium"
          >
            Download as Image
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
