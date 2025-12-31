import { useState } from 'react';

interface HelpSectionProps {
  onClose: () => void;
}

export function HelpSection({ onClose }: HelpSectionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('how-it-works');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-dark-900 rounded-lg border border-dark-700 shadow-xl max-w-3xl w-full my-8 animate-slideUp">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between sticky top-0 bg-dark-900 rounded-t-lg z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-100">
              📖 Help & Instructions
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Learn how the Trainer Payment Calculator works
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
        <div className="p-6 space-y-4">
          {/* How It Works */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('how-it-works')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-700/50 transition-colors"
            >
              <span className="font-semibold text-gray-100">
                🧮 How Payment Calculation Works
              </span>
              <span className="text-gray-400">
                {expandedSection === 'how-it-works' ? '▼' : '▶'}
              </span>
            </button>
            {expandedSection === 'how-it-works' && (
              <div className="px-4 py-3 border-t border-dark-700 space-y-3 text-gray-300">
                <p>
                  The calculator uses a <strong className="text-blue-400">budget-sharing model</strong> where 
                  session hours are <strong>split equally</strong> among all trainers present.
                </p>
                
                <div className="bg-dark-900 p-4 rounded-lg border border-dark-600">
                  <p className="text-sm text-gray-400 mb-2">Formula:</p>
                  <code className="text-green-400 font-mono">
                    hours_per_trainer = session_duration ÷ trainers_present
                  </code>
                </div>

                <div className="space-y-2">
                  <p className="font-medium text-gray-100">Examples:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        <strong>2-hour session, 2 trainers:</strong> Each trainer gets 1 hour credited
                        <br />
                        <code className="text-xs text-gray-500">2h ÷ 2 = 1h per trainer</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        <strong>3-hour session, 3 trainers:</strong> Each trainer gets 1 hour credited
                        <br />
                        <code className="text-xs text-gray-500">3h ÷ 3 = 1h per trainer</code>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>
                        <strong>2-hour session, 1 trainer:</strong> That trainer gets 2 hours credited
                        <br />
                        <code className="text-xs text-gray-500">2h ÷ 1 = 2h</code>
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-yellow-400 bg-yellow-500/10 p-3 rounded border border-yellow-500/30">
                  💡 <strong>Why this model?</strong> It ensures a fixed budget per session 
                  regardless of trainer attendance, encouraging efficient resource allocation.
                </p>
              </div>
            )}
          </div>

          {/* How to Use */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('how-to-use')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-700/50 transition-colors"
            >
              <span className="font-semibold text-gray-100">
                🚀 How to Use the Calculator
              </span>
              <span className="text-gray-400">
                {expandedSection === 'how-to-use' ? '▼' : '▶'}
              </span>
            </button>
            {expandedSection === 'how-to-use' && (
              <div className="px-4 py-3 border-t border-dark-700 space-y-3 text-gray-300">
                <ol className="space-y-3 list-decimal list-inside">
                  <li>
                    <strong className="text-gray-100">Enter Group Name & Price</strong>
                    <p className="text-sm text-gray-400 ml-6 mt-1">
                      If you've processed this group before, the price and durations will auto-fill.
                    </p>
                  </li>
                  <li>
                    <strong className="text-gray-100">Upload Excel File</strong>
                    <p className="text-sm text-gray-400 ml-6 mt-1">
                      Drag & drop or click to select your attendance Excel file.
                    </p>
                  </li>
                  <li>
                    <strong className="text-gray-100">Configure Time Slots</strong>
                    <p className="text-sm text-gray-400 ml-6 mt-1">
                      Set the duration (in hours) for each detected time slot.
                    </p>
                  </li>
                  <li>
                    <strong className="text-gray-100">Calculate Payments</strong>
                    <p className="text-sm text-gray-400 ml-6 mt-1">
                      Review results and process additional groups if needed.
                    </p>
                  </li>
                  <li>
                    <strong className="text-gray-100">View Combined Results</strong>
                    <p className="text-sm text-gray-400 ml-6 mt-1">
                      See totals across all processed groups. Edit or delete groups as needed.
                    </p>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Excel Format */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('excel-format')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-700/50 transition-colors"
            >
              <span className="font-semibold text-gray-100">
                📊 Required Excel Format
              </span>
              <span className="text-gray-400">
                {expandedSection === 'excel-format' ? '▼' : '▶'}
              </span>
            </button>
            {expandedSection === 'excel-format' && (
              <div className="px-4 py-3 border-t border-dark-700 space-y-3 text-gray-300">
                <p>Your Excel file should have these columns:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      <strong className="text-gray-100">Event:</strong> Training date
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      <strong className="text-gray-100">Tijd:</strong> Time slot in HH:MM format (e.g., "18:30")
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      <strong className="text-gray-100">Trainer columns:</strong> Each trainer has their own column
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      <strong className="text-gray-100">Totals:</strong> Number of trainers present per session
                    </span>
                  </li>
                </ul>

                <div className="bg-dark-900 p-3 rounded border border-dark-600">
                  <p className="text-xs text-gray-400 mb-2">Attendance Marking:</p>
                  <ul className="text-sm space-y-1">
                    <li>✅ <code className="text-green-400">"Trainer (1)"</code> = Present</li>
                    <li>❌ <code className="text-gray-500">Empty cell</code> = Absent</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-400">
                  Rows with missing Event or Tijd will be skipped and shown in warnings.
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('features')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-700/50 transition-colors"
            >
              <span className="font-semibold text-gray-100">
                ✨ Key Features
              </span>
              <span className="text-gray-400">
                {expandedSection === 'features' ? '▼' : '▶'}
              </span>
            </button>
            {expandedSection === 'features' && (
              <div className="px-4 py-3 border-t border-dark-700 space-y-2 text-gray-300">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Auto-save configurations for quick reuse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Process multiple groups and see combined totals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Edit or delete processed groups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Detailed breakdown shows hours per time slot</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Validation warnings for skipped rows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Trainers with 0 hours are automatically hidden</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-dark-800/50 border-t border-dark-700 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
