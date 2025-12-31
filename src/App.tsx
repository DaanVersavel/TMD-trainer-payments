import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import {
  FileUpload,
  GroupConfiguration,
  TimeSlotConfiguration,
  GroupResults,
  ValidationWarnings,
  ProcessingStatus,
  DetailedBreakdown,
  EditGroupModal,
  CombinedResults,
  ConfigurationManager,
  HelpSection,
} from './components';
import { deleteConfig } from './services/storageService';

function App() {
  const { state, sessionCounts, actions } = useAppState();
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [showConfigManager, setShowConfigManager] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleEditGroup = (groupName: string) => {
    setEditingGroup(groupName);
  };

  const handleCloseEdit = () => {
    setEditingGroup(null);
  };

  const handleDeleteConfig = (groupName: string) => {
    deleteConfig(groupName);
    // Reload configs
    actions.reloadConfigs();
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Trainer Payment Calculator
              </h1>
              <p className="text-gray-400 mt-1">
                Calculate trainer payments based on attendance records
              </p>
              {state.accumulatedResults.groups.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    📊 Processed Groups: {state.accumulatedResults.groups.length}
                  </span>
                  <button
                    type="button"
                    onClick={actions.viewCombined}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    View Combined Results
                  </button>
                </div>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-dark-800 rounded-lg transition-colors"
                title="Help & Instructions"
              >
                ❓
              </button>
              <button
                type="button"
                onClick={() => setShowConfigManager(true)}
                className="px-3 py-2 text-gray-400 hover:text-gray-300 hover:bg-dark-800 rounded-lg transition-colors"
                title="Manage Configurations"
              >
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* Processing Indicator */}
        {state.isProcessing && <ProcessingStatus />}

        {/* Main Content */}
        {!state.isProcessing && (
          <>
            {/* Step 1: Upload */}
            {state.currentStep === 'upload' && (
              <div className="bg-dark-900 rounded-lg shadow-sm border border-dark-700 p-6 space-y-6 animate-slideUp">
                <h2 className="text-lg font-semibold text-gray-100">
                  📁 Upload Training Group Data
                </h2>

                <GroupConfiguration
                  groupName={state.currentGroupName}
                  pricePerHour={state.currentPricePerHour}
                  onGroupNameChange={actions.setGroupName}
                  onPriceChange={actions.setPrice}
                  onConfigLoaded={actions.loadConfig}
                  savedConfigs={state.savedConfigs}
                />

                <FileUpload
                  onFileSelect={actions.handleFileUpload}
                  isProcessing={state.isProcessing}
                  error={state.error}
                />
              </div>
            )}

            {/* Step 2: Configure */}
            {state.currentStep === 'configure' && state.parsedData && (
              <div className="bg-dark-900 rounded-lg shadow-sm border border-dark-700 p-6 space-y-6 animate-slideUp">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-100">
                    Configure Time Slots - {state.currentGroupName || 'Unnamed Group'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    Price: €{state.currentPricePerHour ?? '?'}/h
                  </span>
                </div>

                {/* Show warnings if any */}
                {state.parsedData.warnings.length > 0 && (
                  <ValidationWarnings warnings={state.parsedData.warnings} />
                )}

                {/* File info */}
                <div className="text-sm text-gray-400 bg-dark-800 p-3 rounded-lg border border-dark-700">
                  <p>📄 File: {state.parsedData.fileName}</p>
                  <p>📋 Sessions found: {state.parsedData.sessions.length}</p>
                  <p>👥 Trainers detected: {state.parsedData.trainerNames.length}</p>
                </div>

                <TimeSlotConfiguration
                  timeSlots={state.parsedData.timeSlots}
                  sessionCounts={sessionCounts}
                  configs={state.timeSlotConfigs}
                  onConfigChange={actions.setTimeSlotConfigs}
                />

                {/* Error message */}
                {state.error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-slideDown">
                    <p className="text-sm text-red-400">{state.error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={actions.resetForNewGroup}
                    className="px-4 py-2.5 bg-dark-800 border border-dark-600 text-gray-300 rounded-lg hover:bg-dark-700 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={actions.calculatePayments}
                    disabled={!state.currentGroupName || !state.currentPricePerHour}
                    className={`
                      flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors
                      ${
                        state.currentGroupName && state.currentPricePerHour
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Calculate Payments →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Results */}
            {state.currentStep === 'results' && state.currentGroupResults && (
              <div className="space-y-4 animate-slideUp">
                <GroupResults
                  results={state.currentGroupResults}
                  onProcessAnother={actions.resetForNewGroup}
                  onViewCombined={actions.viewCombined}
                  showCombinedButton={state.accumulatedResults.groups.length > 0}
                />
                
                {/* Detailed Breakdown Toggle */}
                <button
                  type="button"
                  onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                  className="w-full px-4 py-2 text-sm text-gray-400 hover:text-gray-300 border border-dark-700 rounded-lg hover:bg-dark-800 transition-colors"
                >
                  {showDetailedBreakdown ? '▼ Hide' : '▶ Show'} Detailed Breakdown
                </button>
                
                {showDetailedBreakdown && (
                  <DetailedBreakdown results={state.currentGroupResults} />
                )}
              </div>
            )}

            {/* Step 4: Combined Results */}
            {state.currentStep === 'combined' && (
              <div className="animate-slideUp">
                <CombinedResults
                  results={state.accumulatedResults}
                  onProcessAnother={actions.resetForNewGroup}
                  onDeleteGroup={actions.deleteGroup}
                  onEditGroup={handleEditGroup}
                  onStartOver={actions.resetAll}
                />
              </div>
            )}
          </>
        )}

        {/* Edit Group Modal */}
        {editingGroup && (
          <EditGroupModal
            groupName={editingGroup}
            results={state.accumulatedResults}
            onClose={handleCloseEdit}
            onSave={actions.updateGroup}
          />
        )}

        {/* Configuration Manager Modal */}
        {showConfigManager && (
          <ConfigurationManager
            configs={state.savedConfigs}
            onDeleteConfig={handleDeleteConfig}
            onClose={() => setShowConfigManager(false)}
          />
        )}

        {/* Help Section Modal */}
        {showHelp && (
          <HelpSection onClose={() => setShowHelp(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
