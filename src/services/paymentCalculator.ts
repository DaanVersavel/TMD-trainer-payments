import type {
  TrainingSession,
  TimeSlotConfig,
  TrainerHours,
  TrainerPayment,
  GroupResults,
  CombinedResults,
  ProcessingWarning,
} from '../types';
import { INITIAL_COMBINED_RESULTS } from '../types';

/**
 * Calculate hours per trainer based on sessions and configurations
 * Uses SPLIT HOURS model: hours_per_trainer = duration / totals
 */
export function calculateTrainerHours(
  sessions: TrainingSession[],
  timeSlotConfigs: TimeSlotConfig[]
): TrainerHours[] {
  // Create a map for quick time slot duration lookup
  const durationMap = new Map<string, number>(
    timeSlotConfigs.map((c) => [c.timeSlot, c.duration])
  );

  // Track hours per trainer
  const trainerData = new Map<
    string,
    { hoursByTimeSlot: Record<string, number>; sessionCount: number }
  >();

  for (const session of sessions) {
    const duration = durationMap.get(session.time);
    if (duration === undefined) {
      console.warn(`No duration configured for time slot ${session.time}`);
      continue;
    }

    // SPLIT HOURS MODEL: hours are divided among trainers present
    const hoursPerTrainer = duration / session.totals;

    for (const trainerName of session.trainersPresent) {
      if (!trainerData.has(trainerName)) {
        trainerData.set(trainerName, { hoursByTimeSlot: {}, sessionCount: 0 });
      }

      const data = trainerData.get(trainerName)!;
      data.hoursByTimeSlot[session.time] =
        (data.hoursByTimeSlot[session.time] || 0) + hoursPerTrainer;
      data.sessionCount += 1;
    }
  }

  // Convert to array of TrainerHours
  const result: TrainerHours[] = [];
  for (const [trainerName, data] of trainerData) {
    const totalHours = Object.values(data.hoursByTimeSlot).reduce(
      (sum, hours) => sum + hours,
      0
    );

    result.push({
      trainerName,
      hoursByTimeSlot: data.hoursByTimeSlot,
      totalHours,
      sessionCount: data.sessionCount,
    });
  }

  // Sort by trainer name
  return result.sort((a, b) => a.trainerName.localeCompare(b.trainerName));
}

/**
 * Calculate payments for trainers
 * Filters out trainers with 0 total hours
 */
export function calculatePayments(
  trainerHours: TrainerHours[],
  pricePerHour: number,
  groupName: string
): TrainerPayment[] {
  return trainerHours
    .filter((th) => th.totalHours > 0)
    .map((th) => ({
      trainerName: th.trainerName,
      totalHours: th.totalHours,
      totalPayment: th.totalHours * pricePerHour,
      groupName,
    }))
    .sort((a, b) => a.trainerName.localeCompare(b.trainerName));
}

/**
 * Process a complete group and return results
 */
export function processGroup(
  sessions: TrainingSession[],
  timeSlotConfigs: TimeSlotConfig[],
  groupName: string,
  pricePerHour: number,
  warnings: ProcessingWarning[]
): GroupResults {
  const trainerHours = calculateTrainerHours(sessions, timeSlotConfigs);
  const trainerPayments = calculatePayments(trainerHours, pricePerHour, groupName);

  const totalHours = trainerPayments.reduce((sum, tp) => sum + tp.totalHours, 0);
  const totalPayment = trainerPayments.reduce((sum, tp) => sum + tp.totalPayment, 0);

  return {
    groupName,
    pricePerHour,
    trainerPayments,
    trainerHours: trainerHours.filter((th) => th.totalHours > 0),
    totalHours,
    totalPayment,
    processedAt: new Date().toISOString(),
    warnings,
    sessionCount: sessions.length,
  };
}

/**
 * Accumulate results across multiple groups
 * Uses exact string matching for trainer names
 */
export function accumulateResults(
  existingResults: CombinedResults,
  newGroupResults: GroupResults
): CombinedResults {
  // Check if group already exists (for edit case)
  const existingGroupIndex = existingResults.groups.findIndex(
    (g) => g.groupName === newGroupResults.groupName
  );

  let updatedGroups: GroupResults[];
  if (existingGroupIndex >= 0) {
    // Replace existing group
    updatedGroups = [...existingResults.groups];
    updatedGroups[existingGroupIndex] = newGroupResults;
  } else {
    // Add new group
    updatedGroups = [...existingResults.groups, newGroupResults];
  }

  // Recalculate trainer totals from all groups
  const trainerTotals: Record<string, { hours: number; payment: number }> = {};

  for (const group of updatedGroups) {
    for (const payment of group.trainerPayments) {
      if (!trainerTotals[payment.trainerName]) {
        trainerTotals[payment.trainerName] = { hours: 0, payment: 0 };
      }
      trainerTotals[payment.trainerName].hours += payment.totalHours;
      trainerTotals[payment.trainerName].payment += payment.totalPayment;
    }
  }

  // Calculate grand totals
  const grandTotalHours = Object.values(trainerTotals).reduce(
    (sum, t) => sum + t.hours,
    0
  );
  const grandTotalPayment = Object.values(trainerTotals).reduce(
    (sum, t) => sum + t.payment,
    0
  );

  return {
    groups: updatedGroups,
    trainerTotals,
    grandTotalHours,
    grandTotalPayment,
  };
}

/**
 * Remove a processed group from accumulated results
 * Recalculates trainer totals
 */
export function removeGroup(
  results: CombinedResults,
  groupName: string
): CombinedResults {
  const updatedGroups = results.groups.filter((g) => g.groupName !== groupName);

  if (updatedGroups.length === 0) {
    return INITIAL_COMBINED_RESULTS;
  }

  // Recalculate trainer totals
  const trainerTotals: Record<string, { hours: number; payment: number }> = {};

  for (const group of updatedGroups) {
    for (const payment of group.trainerPayments) {
      if (!trainerTotals[payment.trainerName]) {
        trainerTotals[payment.trainerName] = { hours: 0, payment: 0 };
      }
      trainerTotals[payment.trainerName].hours += payment.totalHours;
      trainerTotals[payment.trainerName].payment += payment.totalPayment;
    }
  }

  const grandTotalHours = Object.values(trainerTotals).reduce(
    (sum, t) => sum + t.hours,
    0
  );
  const grandTotalPayment = Object.values(trainerTotals).reduce(
    (sum, t) => sum + t.payment,
    0
  );

  return {
    groups: updatedGroups,
    trainerTotals,
    grandTotalHours,
    grandTotalPayment,
  };
}

/**
 * Round hours to specified decimal places (for display)
 */
export function roundHours(hours: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(hours * factor) / factor;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '€'): string {
  return `${roundHours(amount, 2).toFixed(2)}${currency}`;
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  return `${roundHours(hours, 2)}h`;
}
