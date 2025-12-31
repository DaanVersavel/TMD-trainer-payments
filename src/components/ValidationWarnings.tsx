import { useState } from 'react';
import type { ProcessingWarning } from '../types';

interface ValidationWarningsProps {
  warnings: ProcessingWarning[];
  title?: string;
}

export function ValidationWarnings({
  warnings,
  title = 'Processing Warnings',
}: ValidationWarningsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-yellow-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-yellow-500">⚠️</span>
          <span className="font-medium text-yellow-400">
            {warnings.length} row{warnings.length !== 1 ? 's' : ''} skipped
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-yellow-500 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-yellow-500/30">
          <h4 className="text-sm font-medium text-yellow-400 mt-3 mb-2">
            {title}
          </h4>
          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li
                key={`${warning.row}-${index}`}
                className="text-sm text-yellow-300/80 flex items-start gap-2"
              >
                <span className="text-yellow-500 mt-0.5">•</span>
                <div>
                  <span className="font-medium">Row {warning.row}:</span>{' '}
                  {getWarningMessage(warning.reason)}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-yellow-500/70 italic">
            These rows were excluded from calculations. Check your Excel file if
            you believe this is an error.
          </p>
        </div>
      )}
    </div>
  );
}

function getWarningMessage(reason: ProcessingWarning['reason']): string {
  switch (reason) {
    case 'MISSING_TIME':
      return 'Missing or invalid Event time';
    case 'MISSING_TOTALS':
      return 'Missing or invalid Totals value';
    case 'MISSING_DATE':
      return 'Missing date (Datum activiteit)';
    case 'INVALID_TOTALS':
      return 'Invalid Totals value (must be positive integer)';
    default:
      return 'Unknown error';
  }
}
