import { describe, test, expect } from 'vitest';
import {
  calculateTrainerHours,
  calculatePayments,
  accumulateResults,
  removeGroup,
  roundHours,
  formatCurrency,
  formatHours,
} from '../src/services/paymentCalculator';
import type { TrainingSession, TimeSlotConfig, CombinedResults, GroupResults } from '../src/types';
import { INITIAL_COMBINED_RESULTS } from '../src/types';

describe('calculateTrainerHours - Split Hours Model', () => {
  const timeSlotConfigs: TimeSlotConfig[] = [
    { timeSlot: '18:30', duration: 2 },
    { timeSlot: '10:00', duration: 1.5 },
  ];

  test('2 trainers share 2-hour session → each gets 1 hour', () => {
    const sessions: TrainingSession[] = [
      {
        date: '04/11/2025',
        time: '18:30',
        eventName: 'U10 - Training',
        totals: 2,
        trainersPresent: ['Trainer A', 'Trainer B'],
        rowNumber: 2,
      },
    ];

    const result = calculateTrainerHours(sessions, timeSlotConfigs);

    expect(result).toHaveLength(2);
    expect(result.find((t) => t.trainerName === 'Trainer A')?.totalHours).toBe(1);
    expect(result.find((t) => t.trainerName === 'Trainer B')?.totalHours).toBe(1);
  });

  test('1 trainer alone in 2-hour session → gets 2 hours', () => {
    const sessions: TrainingSession[] = [
      {
        date: '04/11/2025',
        time: '18:30',
        eventName: 'U10 - Training',
        totals: 1,
        trainersPresent: ['Trainer A'],
        rowNumber: 2,
      },
    ];

    const result = calculateTrainerHours(sessions, timeSlotConfigs);

    expect(result).toHaveLength(1);
    expect(result[0].trainerName).toBe('Trainer A');
    expect(result[0].totalHours).toBe(2);
  });

  test('3 trainers share 3-hour session → each gets 1 hour', () => {
    const configs: TimeSlotConfig[] = [{ timeSlot: '19:00', duration: 3 }];
    const sessions: TrainingSession[] = [
      {
        date: '04/11/2025',
        time: '19:00',
        eventName: 'U10 - Training',
        totals: 3,
        trainersPresent: ['Trainer A', 'Trainer B', 'Trainer C'],
        rowNumber: 2,
      },
    ];

    const result = calculateTrainerHours(sessions, configs);

    expect(result).toHaveLength(3);
    expect(result.every((t) => t.totalHours === 1)).toBe(true);
  });

  test('trainer with mixed sessions calculates correctly', () => {
    const sessions: TrainingSession[] = [
      {
        date: '04/11/2025',
        time: '18:30',
        eventName: 'U10 - Training',
        totals: 2,
        trainersPresent: ['Trainer A', 'Trainer B'],
        rowNumber: 2,
      },
      {
        date: '05/11/2025',
        time: '10:00',
        eventName: 'U10 - Training',
        totals: 1,
        trainersPresent: ['Trainer A'],
        rowNumber: 3,
      },
    ];

    const result = calculateTrainerHours(sessions, timeSlotConfigs);

    // Trainer A: 2h/2 = 1h (18:30) + 1.5h/1 = 1.5h (10:00) = 2.5h total
    const trainerA = result.find((t) => t.trainerName === 'Trainer A');
    expect(trainerA?.totalHours).toBe(2.5);
    expect(trainerA?.sessionCount).toBe(2);
    expect(trainerA?.hoursByTimeSlot['18:30']).toBe(1);
    expect(trainerA?.hoursByTimeSlot['10:00']).toBe(1.5);

    // Trainer B: 2h/2 = 1h (18:30 only)
    const trainerB = result.find((t) => t.trainerName === 'Trainer B');
    expect(trainerB?.totalHours).toBe(1);
    expect(trainerB?.sessionCount).toBe(1);
  });

  test('multiple sessions same time slot accumulate correctly', () => {
    const sessions: TrainingSession[] = [
      {
        date: '04/11/2025',
        time: '18:30',
        eventName: 'U10 - Training',
        totals: 2,
        trainersPresent: ['Trainer A', 'Trainer B'],
        rowNumber: 2,
      },
      {
        date: '11/11/2025',
        time: '18:30',
        eventName: 'U10 - Training',
        totals: 2,
        trainersPresent: ['Trainer A', 'Trainer B'],
        rowNumber: 3,
      },
    ];

    const result = calculateTrainerHours(sessions, timeSlotConfigs);

    // Each trainer gets 1h per session, 2 sessions = 2h each
    expect(result.find((t) => t.trainerName === 'Trainer A')?.totalHours).toBe(2);
    expect(result.find((t) => t.trainerName === 'Trainer B')?.totalHours).toBe(2);
  });
});

describe('calculatePayments', () => {
  test('calculates payment correctly', () => {
    const trainerHours = [
      { trainerName: 'Trainer A', hoursByTimeSlot: { '18:30': 10 }, totalHours: 10, sessionCount: 5 },
      { trainerName: 'Trainer B', hoursByTimeSlot: { '18:30': 5 }, totalHours: 5, sessionCount: 5 },
    ];

    const result = calculatePayments(trainerHours, 15, 'U10');

    expect(result).toHaveLength(2);
    expect(result.find((p) => p.trainerName === 'Trainer A')?.totalPayment).toBe(150);
    expect(result.find((p) => p.trainerName === 'Trainer B')?.totalPayment).toBe(75);
  });

  test('trainer with 0 hours is filtered out', () => {
    const trainerHours = [
      { trainerName: 'Trainer A', hoursByTimeSlot: { '18:30': 10 }, totalHours: 10, sessionCount: 5 },
      { trainerName: 'Trainer B', hoursByTimeSlot: {}, totalHours: 0, sessionCount: 0 },
    ];

    const result = calculatePayments(trainerHours, 15, 'U10');

    expect(result).toHaveLength(1);
    expect(result[0].trainerName).toBe('Trainer A');
  });
});

describe('accumulateResults', () => {
  test('same trainer across 2 groups accumulates correctly', () => {
    const group1: GroupResults = {
      groupName: 'U10',
      pricePerHour: 15,
      trainerPayments: [
        { trainerName: 'Van Acker Maxime', totalHours: 15, totalPayment: 225, groupName: 'U10' },
      ],
      trainerHours: [],
      totalHours: 15,
      totalPayment: 225,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 10,
    };

    const group2: GroupResults = {
      groupName: 'U12',
      pricePerHour: 15,
      trainerPayments: [
        { trainerName: 'Van Acker Maxime', totalHours: 30, totalPayment: 450, groupName: 'U12' },
      ],
      trainerHours: [],
      totalHours: 30,
      totalPayment: 450,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 15,
    };

    let combined = accumulateResults(INITIAL_COMBINED_RESULTS, group1);
    combined = accumulateResults(combined, group2);

    expect(combined.groups).toHaveLength(2);
    expect(combined.trainerTotals['Van Acker Maxime'].hours).toBe(45);
    expect(combined.trainerTotals['Van Acker Maxime'].payment).toBe(675);
    expect(combined.grandTotalHours).toBe(45);
    expect(combined.grandTotalPayment).toBe(675);
  });

  test('different trainers in different groups all appear', () => {
    const group1: GroupResults = {
      groupName: 'U10',
      pricePerHour: 15,
      trainerPayments: [
        { trainerName: 'Trainer A', totalHours: 10, totalPayment: 150, groupName: 'U10' },
      ],
      trainerHours: [],
      totalHours: 10,
      totalPayment: 150,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 5,
    };

    const group2: GroupResults = {
      groupName: 'U12',
      pricePerHour: 20,
      trainerPayments: [
        { trainerName: 'Trainer B', totalHours: 5, totalPayment: 100, groupName: 'U12' },
      ],
      trainerHours: [],
      totalHours: 5,
      totalPayment: 100,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 3,
    };

    let combined = accumulateResults(INITIAL_COMBINED_RESULTS, group1);
    combined = accumulateResults(combined, group2);

    expect(Object.keys(combined.trainerTotals)).toHaveLength(2);
    expect(combined.trainerTotals['Trainer A'].hours).toBe(10);
    expect(combined.trainerTotals['Trainer B'].hours).toBe(5);
    expect(combined.grandTotalHours).toBe(15);
    expect(combined.grandTotalPayment).toBe(250);
  });

  test('replacing existing group updates correctly', () => {
    const group1: GroupResults = {
      groupName: 'U10',
      pricePerHour: 15,
      trainerPayments: [
        { trainerName: 'Trainer A', totalHours: 10, totalPayment: 150, groupName: 'U10' },
      ],
      trainerHours: [],
      totalHours: 10,
      totalPayment: 150,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 5,
    };

    const group1Updated: GroupResults = {
      groupName: 'U10',
      pricePerHour: 20, // Changed price
      trainerPayments: [
        { trainerName: 'Trainer A', totalHours: 10, totalPayment: 200, groupName: 'U10' },
      ],
      trainerHours: [],
      totalHours: 10,
      totalPayment: 200,
      processedAt: new Date().toISOString(),
      warnings: [],
      sessionCount: 5,
    };

    let combined = accumulateResults(INITIAL_COMBINED_RESULTS, group1);
    combined = accumulateResults(combined, group1Updated);

    expect(combined.groups).toHaveLength(1);
    expect(combined.trainerTotals['Trainer A'].payment).toBe(200);
    expect(combined.grandTotalPayment).toBe(200);
  });
});

describe('removeGroup', () => {
  test('removing middle group recalculates correctly', () => {
    const groups: GroupResults[] = [
      {
        groupName: 'U10',
        pricePerHour: 15,
        trainerPayments: [
          { trainerName: 'Trainer A', totalHours: 10, totalPayment: 150, groupName: 'U10' },
        ],
        trainerHours: [],
        totalHours: 10,
        totalPayment: 150,
        processedAt: new Date().toISOString(),
        warnings: [],
        sessionCount: 5,
      },
      {
        groupName: 'U12',
        pricePerHour: 15,
        trainerPayments: [
          { trainerName: 'Trainer A', totalHours: 20, totalPayment: 300, groupName: 'U12' },
        ],
        trainerHours: [],
        totalHours: 20,
        totalPayment: 300,
        processedAt: new Date().toISOString(),
        warnings: [],
        sessionCount: 10,
      },
      {
        groupName: 'U19',
        pricePerHour: 15,
        trainerPayments: [
          { trainerName: 'Trainer A', totalHours: 15, totalPayment: 225, groupName: 'U19' },
        ],
        trainerHours: [],
        totalHours: 15,
        totalPayment: 225,
        processedAt: new Date().toISOString(),
        warnings: [],
        sessionCount: 8,
      },
    ];

    const combined: CombinedResults = {
      groups,
      trainerTotals: { 'Trainer A': { hours: 45, payment: 675 } },
      grandTotalHours: 45,
      grandTotalPayment: 675,
    };

    const result = removeGroup(combined, 'U12');

    expect(result.groups).toHaveLength(2);
    expect(result.groups.map((g) => g.groupName)).toEqual(['U10', 'U19']);
    expect(result.trainerTotals['Trainer A'].hours).toBe(25);
    expect(result.trainerTotals['Trainer A'].payment).toBe(375);
    expect(result.grandTotalHours).toBe(25);
    expect(result.grandTotalPayment).toBe(375);
  });

  test('removing last group returns initial state', () => {
    const combined: CombinedResults = {
      groups: [
        {
          groupName: 'U10',
          pricePerHour: 15,
          trainerPayments: [],
          trainerHours: [],
          totalHours: 10,
          totalPayment: 150,
          processedAt: new Date().toISOString(),
          warnings: [],
          sessionCount: 5,
        },
      ],
      trainerTotals: {},
      grandTotalHours: 10,
      grandTotalPayment: 150,
    };

    const result = removeGroup(combined, 'U10');

    expect(result).toEqual(INITIAL_COMBINED_RESULTS);
  });
});

describe('utility functions', () => {
  test('roundHours rounds to specified decimals', () => {
    expect(roundHours(1.234, 2)).toBe(1.23);
    expect(roundHours(1.235, 2)).toBe(1.24);
    expect(roundHours(1.5, 1)).toBe(1.5);
  });

  test('formatCurrency formats correctly', () => {
    expect(formatCurrency(150)).toBe('150.00€');
    expect(formatCurrency(22.5)).toBe('22.50€');
    expect(formatCurrency(100, '$')).toBe('100.00$');
  });

  test('formatHours formats correctly', () => {
    expect(formatHours(10)).toBe('10h');
    expect(formatHours(1.5)).toBe('1.5h');
    expect(formatHours(2.333)).toBe('2.33h');
  });
});
