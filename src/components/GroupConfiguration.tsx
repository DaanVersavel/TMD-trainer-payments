import { useEffect, useState } from 'react';
import type { GroupConfig } from '../types';
import { loadGroupConfig } from '../services/storageService';

interface GroupConfigurationProps {
  groupName: string;
  pricePerHour: number | null;
  onGroupNameChange: (name: string) => void;
  onPriceChange: (price: number | null) => void;
  onConfigLoaded: (config: GroupConfig) => void;
  savedConfigs: GroupConfig[];
  disabled?: boolean;
}

export function GroupConfiguration({
  groupName,
  pricePerHour,
  onGroupNameChange,
  onPriceChange,
  onConfigLoaded,
  savedConfigs,
  disabled = false,
}: GroupConfigurationProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Filter suggestions based on input
  const suggestions = savedConfigs.filter((config) =>
    config.groupName.toLowerCase().includes(groupName.toLowerCase())
  );

  // Auto-load config when group name matches exactly
  useEffect(() => {
    if (groupName && !configLoaded) {
      const savedConfig = loadGroupConfig(groupName);
      if (savedConfig) {
        onConfigLoaded(savedConfig);
        setConfigLoaded(true);
      }
    }
  }, [groupName, configLoaded, onConfigLoaded]);

  // Reset configLoaded when group name changes
  useEffect(() => {
    setConfigLoaded(false);
  }, [groupName]);

  const handleGroupNameChange = (value: string) => {
    onGroupNameChange(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (config: GroupConfig) => {
    onGroupNameChange(config.groupName);
    onConfigLoaded(config);
    setShowSuggestions(false);
    setConfigLoaded(true);
  };

  const handlePriceChange = (value: string) => {
    if (value === '') {
      onPriceChange(null);
    } else {
      const num = parseFloat(value);
      if (!isNaN(num) && num >= 0) {
        onPriceChange(num);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Group Name Input */}
      <div className="relative">
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => handleGroupNameChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="e.g., U10, U12, U19"
          disabled={disabled}
          className={`
            w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg
            text-gray-100 placeholder-gray-500
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && groupName && (
          <div className="absolute z-10 w-full mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-lg max-h-48 overflow-auto">
            {suggestions.map((config) => (
              <button
                key={config.groupName}
                type="button"
                onClick={() => handleSuggestionClick(config)}
                className="w-full px-3 py-2 text-left hover:bg-dark-700 flex justify-between items-center text-gray-100"
              >
                <span className="font-medium">{config.groupName}</span>
                <span className="text-sm text-gray-400">
                  €{config.pricePerHour}/h
                </span>
              </button>
            ))}
          </div>
        )}

        {configLoaded && (
          <p className="mt-1 text-xs text-green-400">
            ✓ Configuration loaded from saved settings
          </p>
        )}
      </div>

      {/* Price Per Hour Input */}
      <div>
        <label
          htmlFor="pricePerHour"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Price per Hour (€)
        </label>
        <div className="relative">
          <input
            type="number"
            id="pricePerHour"
            value={pricePerHour ?? ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="e.g., 15"
            min="0"
            step="0.5"
            disabled={disabled}
            className={`
              w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg
              text-gray-100 placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <span className="absolute right-3 top-2 text-gray-500">€</span>
        </div>
      </div>
    </div>
  );
}
