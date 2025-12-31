import { describe, test, expect } from 'vitest';
import { detectTimeSlots, countSessionsPerTimeSlot } from '../src/services/excelParser';
import type { TrainingSession } from '../src/types';

// Note: Full Excel parsing tests would require mocking the xlsx library
// These tests cover the utility functions that don't require file access

describe('detectTimeSlots', () => {
  test('returns unique sorted time slots', () => {
    const sessions: TrainingSession[] = [
      { date: '01/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 2 },
      { date: '02/01/2025', time: '10:00', eventName: 'Training', totals: 1, trainersPresent: [], rowNumber: 3 },
      { date: '03/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 4 },
      { date: '04/01/2025', time: '14:00', eventName: 'Training', totals: 1, trainersPresent: [], rowNumber: 5 },
    ];

    const result = detectTimeSlots(sessions);

    expect(result).toEqual(['10:00', '14:00', '18:30']);
  });

  test('returns empty array for no sessions', () => {
    const result = detectTimeSlots([]);
    expect(result).toEqual([]);
  });

  test('handles single time slot', () => {
    const sessions: TrainingSession[] = [
      { date: '01/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 2 },
      { date: '02/01/2025', time: '18:30', eventName: 'Training', totals: 1, trainersPresent: [], rowNumber: 3 },
    ];

    const result = detectTimeSlots(sessions);

    expect(result).toEqual(['18:30']);
  });
});

describe('countSessionsPerTimeSlot', () => {
  test('counts sessions correctly', () => {
    const sessions: TrainingSession[] = [
      { date: '01/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 2 },
      { date: '02/01/2025', time: '10:00', eventName: 'Training', totals: 1, trainersPresent: [], rowNumber: 3 },
      { date: '03/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 4 },
      { date: '04/01/2025', time: '18:30', eventName: 'Training', totals: 2, trainersPresent: [], rowNumber: 5 },
      { date: '05/01/2025', time: '10:00', eventName: 'Training', totals: 1, trainersPresent: [], rowNumber: 6 },
    ];

    const result = countSessionsPerTimeSlot(sessions);

    expect(result).toEqual({
      '18:30': 3,
      '10:00': 2,
    });
  });

  test('returns empty object for no sessions', () => {
    const result = countSessionsPerTimeSlot([]);
    expect(result).toEqual({});
  });
});
