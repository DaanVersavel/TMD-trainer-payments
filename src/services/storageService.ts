import type { GroupConfig } from '../types';

const STORAGE_KEY = 'trainer-payment-configs';

/**
 * Save group configuration to localStorage
 * Overwrites existing config with same group name
 */
export function saveGroupConfig(config: GroupConfig): void {
  const configs = getAllConfigs();
  const existingIndex = configs.findIndex(
    (c) => c.groupName.toLowerCase() === config.groupName.toLowerCase()
  );

  const updatedConfig: GroupConfig = {
    ...config,
    lastUsed: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    configs[existingIndex] = updatedConfig;
  } else {
    configs.push(updatedConfig);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
    throw new Error('Cannot save configuration. Storage limit reached. Please clear old configurations.');
  }
}

/**
 * Load group configuration from localStorage
 * Case-insensitive matching
 */
export function loadGroupConfig(groupName: string): GroupConfig | null {
  const configs = getAllConfigs();
  return (
    configs.find(
      (c) => c.groupName.toLowerCase() === groupName.toLowerCase()
    ) || null
  );
}

/**
 * Get all saved configurations
 */
export function getAllConfigs(): GroupConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as GroupConfig[];
  } catch (error) {
    console.error('Failed to load configs from localStorage:', error);
    return [];
  }
}

/**
 * Delete a saved configuration
 */
export function deleteConfig(groupName: string): void {
  const configs = getAllConfigs();
  const filtered = configs.filter(
    (c) => c.groupName.toLowerCase() !== groupName.toLowerCase()
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Clear all saved configurations
 */
export function clearAllConfigs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
