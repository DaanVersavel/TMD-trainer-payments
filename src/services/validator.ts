import type { GroupConfig, TimeSlotConfig } from '../types';

/**
 * Validate time format (must be HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  if (!time || typeof time !== 'string') return false;
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}

/**
 * Normalize time to HH:MM format (adds leading zero if needed)
 */
export function normalizeTime(time: string): string {
  if (!time) return '';
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  const hours = match[1].padStart(2, '0');
  const minutes = match[2];
  return `${hours}:${minutes}`;
}

/**
 * Validate group configuration
 */
export function validateConfiguration(config: Partial<GroupConfig>): {
  valid: boolean;
  error?: string;
} {
  if (!config.groupName || config.groupName.trim() === '') {
    return { valid: false, error: 'Group name is required' };
  }

  if (config.pricePerHour === undefined || config.pricePerHour === null) {
    return { valid: false, error: 'Price per hour is required' };
  }

  if (config.pricePerHour <= 0) {
    return { valid: false, error: 'Price per hour must be greater than 0' };
  }

  if (!config.timeSlots || config.timeSlots.length === 0) {
    return { valid: false, error: 'At least one time slot configuration is required' };
  }

  for (const slot of config.timeSlots) {
    const slotValidation = validateTimeSlotConfig(slot);
    if (!slotValidation.valid) {
      return slotValidation;
    }
  }

  return { valid: true };
}

/**
 * Validate a single time slot configuration
 */
export function validateTimeSlotConfig(config: TimeSlotConfig): {
  valid: boolean;
  error?: string;
} {
  if (!config.timeSlot || !isValidTimeFormat(config.timeSlot)) {
    return { valid: false, error: `Invalid time format: ${config.timeSlot}. Expected HH:MM` };
  }

  if (config.duration === undefined || config.duration === null) {
    return { valid: false, error: `Duration is required for time slot ${config.timeSlot}` };
  }

  if (config.duration <= 0) {
    return { valid: false, error: `Duration must be greater than 0 for time slot ${config.timeSlot}` };
  }

  return { valid: true };
}

/**
 * Validate that all detected time slots have configurations
 */
export function validateAllTimeSlotsConfigured(
  detectedTimeSlots: string[],
  configs: TimeSlotConfig[]
): { valid: boolean; missingSlots: string[] } {
  const configuredSlots = new Set(configs.map((c) => c.timeSlot));
  const missingSlots = detectedTimeSlots.filter((slot) => !configuredSlots.has(slot));

  return {
    valid: missingSlots.length === 0,
    missingSlots,
  };
}

/**
 * Validate totals value from Excel
 */
export function isValidTotals(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  
  // If it's a number, check if it's a positive integer
  if (typeof value === 'number') {
    return !isNaN(value) && value > 0 && Number.isInteger(value);
  }
  
  // If it's a string, check if it represents a positive integer
  const str = String(value).trim();
  // Reject if contains decimal point
  if (str.includes('.')) return false;
  
  const num = parseInt(str, 10);
  return !isNaN(num) && num > 0 && String(num) === str;
}

/**
 * Parse totals value to number
 */
export function parseTotals(value: unknown): number | null {
  if (!isValidTotals(value)) return null;
  return typeof value === 'number' ? value : parseInt(String(value), 10);
}
