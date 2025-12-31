import type { GroupResults } from '../types';

interface DetailedBreakdownProps {
  results: GroupResults;
}

export function DetailedBreakdown({ results }: DetailedBreakdownProps) {
  if (results.trainerHours.length === 0) {
    return (
      <div className="bg-dark-900 rounded-lg border border-dark-700 p-4">
        <p className="text-gray-500 text-center">No detailed breakdown available</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-900 rounded-lg border border-dark-700 overflow-hidden">
      <div className="px-4 py-3 bg-dark-800 border-b border-dark-700">
        <h3 className="font-medium text-gray-100">📊 Detailed Breakdown - {results.groupName}</h3>
        <p className="text-xs text-gray-500 mt-1">
          Rate: €{results.pricePerHour}/hour | Model: Split Hours
        </p>
      </div>

      <div className="p-4 space-y-6">
        {results.trainerHours.map((trainer) => (
          <div key={trainer.trainerName} className="space-y-2">
            {/* Trainer Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-100">
                👤 {trainer.trainerName}
              </h4>
              <span className="text-sm text-gray-500">
                {trainer.sessionCount} sessions attended
              </span>
            </div>

            {/* Time Slot Breakdown */}
            <div className="ml-4 space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Time slot breakdown:
              </p>
              {Object.entries(trainer.hoursByTimeSlot).map(([timeSlot, hours]) => (
                <div
                  key={timeSlot}
                  className="flex items-center justify-between text-sm bg-dark-800/50 px-3 py-2 rounded border border-dark-700"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">⏰</span>
                    <span className="text-gray-300">{timeSlot}</span>
                    <span className="text-xs text-gray-600">(split hours)</span>
                  </div>
                  <span className="text-blue-400 font-medium">{hours.toFixed(2)}h</span>
                </div>
              ))}
            </div>

            {/* Trainer Totals */}
            <div className="ml-4 mt-2 flex items-center justify-between bg-dark-800 px-3 py-2 rounded border border-dark-600">
              <span className="text-gray-400">Total:</span>
              <div className="flex items-center gap-4">
                <span className="text-gray-300 font-medium">
                  {trainer.totalHours.toFixed(2)}h
                </span>
                <span className="text-green-400 font-semibold">
                  €{(trainer.totalHours * results.pricePerHour).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400">
            ℹ️ <strong>Split Hours Model:</strong> Session hours are divided equally among 
            all trainers present. For example, if 2 trainers attend a 2-hour session, 
            each trainer is credited with 1 hour.
          </p>
        </div>
      </div>
    </div>
  );
}
