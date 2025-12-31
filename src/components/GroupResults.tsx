import type { GroupResults as GroupResultsType } from '../types';
import { formatCurrency, formatHours } from '../services/paymentCalculator';
import { ValidationWarnings } from './ValidationWarnings';

interface GroupResultsProps {
  results: GroupResultsType;
  onProcessAnother: () => void;
  onViewCombined: () => void;
  showCombinedButton: boolean;
}

export function GroupResults({
  results,
  onProcessAnother,
  onViewCombined,
  showCombinedButton,
}: GroupResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-900 rounded-lg border border-dark-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-100">
            Payment Results - {results.groupName}
          </h2>
          <span className="text-sm text-gray-500">
            {results.sessionCount} sessions processed
          </span>
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>Rate: {formatCurrency(results.pricePerHour)}/hour</span>
          <span>•</span>
          <span>Model: Split Hours</span>
        </div>
      </div>

      {/* Warnings */}
      {results.warnings.length > 0 && (
        <ValidationWarnings warnings={results.warnings} />
      )}

      {/* Trainer Payments Table */}
      <div className="bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
        <div className="px-4 py-3 bg-dark-800 border-b border-dark-700">
          <h3 className="font-medium text-gray-100">💰 Trainer Payments</h3>
        </div>

        {results.trainerPayments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No trainer payments to display
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {results.trainerPayments.map((payment) => (
              <div
                key={payment.trainerName}
                className="px-4 py-3 flex items-center justify-between hover:bg-dark-800/50"
              >
                <span className="font-medium text-gray-100">
                  {payment.trainerName}
                </span>
                <div className="flex items-center gap-6 text-right">
                  <span className="text-gray-400 min-w-[80px]">
                    {formatHours(payment.totalHours)}
                  </span>
                  <span className="font-semibold text-green-400 min-w-[100px]">
                    {formatCurrency(payment.totalPayment)}
                  </span>
                </div>
              </div>
            ))}

            {/* Totals Row */}
            <div className="px-4 py-3 bg-dark-800 flex items-center justify-between font-bold">
              <span className="text-gray-100">GROUP TOTAL</span>
              <div className="flex items-center gap-6 text-right">
                <span className="text-gray-300 min-w-[80px]">
                  {formatHours(results.totalHours)}
                </span>
                <span className="text-green-400 min-w-[100px]">
                  {formatCurrency(results.totalPayment)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onProcessAnother}
          className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors font-medium"
        >
          Process Another Group
        </button>
        {showCombinedButton && (
          <button
            type="button"
            onClick={onViewCombined}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Combined Results →
          </button>
        )}
      </div>
    </div>
  );
}
