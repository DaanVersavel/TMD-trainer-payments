import { describe, test, expect } from 'vitest';
import {
  isValidTimeFormat,
  normalizeTime,
  validateConfiguration,
  validateTimeSlotConfig,
  validateAllTimeSlotsConfigured,
  isValidTotals,
  parseTotals,
} from '../src/services/validator';

describe('isValidTimeFormat', () => {
  test('accepts valid HH:MM formats', () => {
    expect(isValidTimeFormat('18:30')).toBe(true);
    expect(isValidTimeFormat('09:15')).toBe(true);
    expect(isValidTimeFormat('00:00')).toBe(true);
    expect(isValidTimeFormat('23:59')).toBe(true);
    expect(isValidTimeFormat('9:30')).toBe(true); // Single digit hour
  });

  test('rejects invalid formats', () => {
    expect(isValidTimeFormat('18:30:00')).toBe(false);
    expect(isValidTimeFormat('6:30 PM')).toBe(false);
    expect(isValidTimeFormat('18h30')).toBe(false);
    expect(isValidTimeFormat('25:00')).toBe(false);
    expect(isValidTimeFormat('12:60')).toBe(false);
    expect(isValidTimeFormat('')).toBe(false);
    expect(isValidTimeFormat('invalid')).toBe(false);
  });
});

describe('normalizeTime', () => {
  test('adds leading zero to single digit hours', () => {
    expect(normalizeTime('9:30')).toBe('09:30');
    expect(normalizeTime('1:00')).toBe('01:00');
  });

  test('keeps valid format unchanged', () => {
    expect(normalizeTime('18:30')).toBe('18:30');
    expect(normalizeTime('09:15')).toBe('09:15');
  });

  test('handles empty string', () => {
    expect(normalizeTime('')).toBe('');
  });
});

describe('validateConfiguration', () => {
  test('rejects empty group name', () => {
    const result = validateConfiguration({
      groupName: '',
      pricePerHour: 15,
      timeSlots: [{ timeSlot: '18:30', duration: 2 }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Group name');
  });

  test('rejects missing price', () => {
    const result = validateConfiguration({
      groupName: 'U10',
      timeSlots: [{ timeSlot: '18:30', duration: 2 }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Price');
  });

  test('rejects zero or negative price', () => {
    const result = validateConfiguration({
      groupName: 'U10',
      pricePerHour: 0,
      timeSlots: [{ timeSlot: '18:30', duration: 2 }],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater than 0');
  });

  test('rejects empty time slots', () => {
    const result = validateConfiguration({
      groupName: 'U10',
      pricePerHour: 15,
      timeSlots: [],
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('time slot');
  });

  test('accepts valid configuration', () => {
    const result = validateConfiguration({
      groupName: 'U10',
      pricePerHour: 15,
      timeSlots: [{ timeSlot: '18:30', duration: 2 }],
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateTimeSlotConfig', () => {
  test('rejects invalid time format', () => {
    const result = validateTimeSlotConfig({ timeSlot: 'invalid', duration: 2 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid time format');
  });

  test('rejects zero duration', () => {
    const result = validateTimeSlotConfig({ timeSlot: '18:30', duration: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('greater than 0');
  });

  test('rejects negative duration', () => {
    const result = validateTimeSlotConfig({ timeSlot: '18:30', duration: -1 });
    expect(result.valid).toBe(false);
  });

  test('accepts valid config', () => {
    const result = validateTimeSlotConfig({ timeSlot: '18:30', duration: 2 });
    expect(result.valid).toBe(true);
  });
});

describe('validateAllTimeSlotsConfigured', () => {
  test('returns valid when all slots configured', () => {
    const detected = ['18:30', '10:00'];
    const configs = [
      { timeSlot: '18:30', duration: 2 },
      { timeSlot: '10:00', duration: 1.5 },
    ];
    const result = validateAllTimeSlotsConfigured(detected, configs);
    expect(result.valid).toBe(true);
    expect(result.missingSlots).toHaveLength(0);
  });

  test('returns invalid with missing slots', () => {
    const detected = ['18:30', '10:00', '14:00'];
    const configs = [{ timeSlot: '18:30', duration: 2 }];
    const result = validateAllTimeSlotsConfigured(detected, configs);
    expect(result.valid).toBe(false);
    expect(result.missingSlots).toEqual(['10:00', '14:00']);
  });
});

describe('isValidTotals', () => {
  test('accepts valid integers', () => {
    expect(isValidTotals(1)).toBe(true);
    expect(isValidTotals(2)).toBe(true);
    expect(isValidTotals(5)).toBe(true);
  });

  test('accepts numeric strings', () => {
    expect(isValidTotals('1')).toBe(true);
    expect(isValidTotals('3')).toBe(true);
  });

  test('rejects zero and negative', () => {
    expect(isValidTotals(0)).toBe(false);
    expect(isValidTotals(-1)).toBe(false);
  });

  test('rejects non-integers', () => {
    expect(isValidTotals(1.5)).toBe(false);
    expect(isValidTotals('1.5')).toBe(false);
  });

  test('rejects empty values', () => {
    expect(isValidTotals('')).toBe(false);
    expect(isValidTotals(null)).toBe(false);
    expect(isValidTotals(undefined)).toBe(false);
  });
});

describe('parseTotals', () => {
  test('parses valid values', () => {
    expect(parseTotals(2)).toBe(2);
    expect(parseTotals('3')).toBe(3);
  });

  test('returns null for invalid values', () => {
    expect(parseTotals('')).toBe(null);
    expect(parseTotals(0)).toBe(null);
    expect(parseTotals('invalid')).toBe(null);
  });
});
