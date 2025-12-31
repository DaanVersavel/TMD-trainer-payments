import { describe, test, expect, beforeEach } from 'vitest';
import {
  saveGroupConfig,
  loadGroupConfig,
  getAllConfigs,
  deleteConfig,
  clearAllConfigs,
} from '../src/services/storageService';
import type { GroupConfig } from '../src/types';

describe('storageService', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  describe('saveGroupConfig', () => {
    test('saves a new configuration', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25.5,
        timeSlots: [
          { timeSlot: '18:30', duration: 2 },
          { timeSlot: '19:00', duration: 1.5 },
        ],
      };

      saveGroupConfig(config);

      const saved = getAllConfigs();
      expect(saved).toHaveLength(1);
      expect(saved[0].groupName).toBe('U10');
      expect(saved[0].pricePerHour).toBe(25.5);
      expect(saved[0].timeSlots).toHaveLength(2);
    });

    test('adds lastUsed timestamp', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [{ timeSlot: '18:30', duration: 2 }],
      };

      saveGroupConfig(config);

      const saved = getAllConfigs();
      expect(saved[0].lastUsed).toBeDefined();
      expect(typeof saved[0].lastUsed).toBe('string');
    });

    test('overwrites existing config with same name (case-insensitive)', () => {
      const config1: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [{ timeSlot: '18:30', duration: 2 }],
      };

      const config2: GroupConfig = {
        groupName: 'u10',
        pricePerHour: 30,
        timeSlots: [{ timeSlot: '18:30', duration: 2.5 }],
      };

      saveGroupConfig(config1);
      saveGroupConfig(config2);

      const saved = getAllConfigs();
      expect(saved).toHaveLength(1);
      expect(saved[0].pricePerHour).toBe(30);
    });

    test('saves multiple different configurations', () => {
      const config1: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [{ timeSlot: '18:30', duration: 2 }],
      };

      const config2: GroupConfig = {
        groupName: 'U12',
        pricePerHour: 30,
        timeSlots: [{ timeSlot: '19:00', duration: 1.5 }],
      };

      saveGroupConfig(config1);
      saveGroupConfig(config2);

      const saved = getAllConfigs();
      expect(saved).toHaveLength(2);
    });
  });

  describe('loadGroupConfig', () => {
    test('loads existing configuration', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [{ timeSlot: '18:30', duration: 2 }],
      };

      saveGroupConfig(config);

      const loaded = loadGroupConfig('U10');
      expect(loaded).not.toBeNull();
      expect(loaded?.groupName).toBe('U10');
      expect(loaded?.pricePerHour).toBe(25);
    });

    test('returns null for non-existent configuration', () => {
      const loaded = loadGroupConfig('NonExistent');
      expect(loaded).toBeNull();
    });

    test('is case-insensitive', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      saveGroupConfig(config);

      const loaded1 = loadGroupConfig('U10');
      const loaded2 = loadGroupConfig('u10');
      const loaded3 = loadGroupConfig('U10');

      expect(loaded1).not.toBeNull();
      expect(loaded2).not.toBeNull();
      expect(loaded3).not.toBeNull();
    });
  });

  describe('getAllConfigs', () => {
    test('returns empty array when no configurations', () => {
      const configs = getAllConfigs();
      expect(configs).toEqual([]);
    });

    test('returns all saved configurations', () => {
      const config1: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      const config2: GroupConfig = {
        groupName: 'U12',
        pricePerHour: 30,
        timeSlots: [],
      };

      saveGroupConfig(config1);
      saveGroupConfig(config2);

      const configs = getAllConfigs();
      expect(configs).toHaveLength(2);
    });

    test('handles corrupted localStorage data', () => {
      localStorage.setItem('trainer-payment-configs', 'invalid json');

      const configs = getAllConfigs();
      expect(configs).toEqual([]);
    });
  });

  describe('deleteConfig', () => {
    test('deletes existing configuration', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      saveGroupConfig(config);
      expect(getAllConfigs()).toHaveLength(1);

      deleteConfig('U10');
      expect(getAllConfigs()).toHaveLength(0);
    });

    test('is case-insensitive', () => {
      const config: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      saveGroupConfig(config);
      deleteConfig('u10');

      expect(getAllConfigs()).toHaveLength(0);
    });

    test('does not affect other configurations', () => {
      const config1: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      const config2: GroupConfig = {
        groupName: 'U12',
        pricePerHour: 30,
        timeSlots: [],
      };

      saveGroupConfig(config1);
      saveGroupConfig(config2);

      deleteConfig('U10');

      const remaining = getAllConfigs();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].groupName).toBe('U12');
    });
  });

  describe('clearAllConfigs', () => {
    test('removes all configurations', () => {
      const config1: GroupConfig = {
        groupName: 'U10',
        pricePerHour: 25,
        timeSlots: [],
      };

      const config2: GroupConfig = {
        groupName: 'U12',
        pricePerHour: 30,
        timeSlots: [],
      };

      saveGroupConfig(config1);
      saveGroupConfig(config2);
      expect(getAllConfigs()).toHaveLength(2);

      clearAllConfigs();
      expect(getAllConfigs()).toHaveLength(0);
    });
  });
});
