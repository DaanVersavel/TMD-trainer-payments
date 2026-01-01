// ============================================
// Configuration Types
// ============================================

/**
 * Configuration for a time slot (duration only)
 */
export type TimeSlotConfig = {
  timeSlot: string;        // e.g., "18:30" (always HH:MM format)
  duration: number;        // in hours, e.g., 2.0 (always whole or .5)
};

/**
 * Full group configuration (saved to localStorage)
 */
export type GroupConfig = {
  groupName: string;       // e.g., "U10"
  pricePerHour: number;    // e.g., 15
  timeSlots: TimeSlotConfig[];
  lastUsed?: string;       // ISO date string (optional, added by storage service)
};

// ============================================
// Training Session Types
// ============================================

/**
 * Training session parsed from Excel
 */
export type TrainingSession = {
  date: string;            // "04/11/2025"
  time: string;            // "18:30" (always HH:MM)
  eventName: string;       // "U10 - Training"
  totals: number;          // 2 (always integer, number of trainers present)
  trainersPresent: string[]; // ["Verpeten Kimi", "Wagener Senne"]
  rowNumber: number;       // Original row number in Excel for warnings
};

/**
 * Raw row data from Excel before processing
 */
export type ExcelRow = {
  'Datum activiteit'?: string;
  'Event time'?: string;
  'Event name'?: string;
  'Totals'?: number | string;
  [key: string]: unknown;  // Trainer columns with dynamic names
};

// ============================================
// Calculation Types
// ============================================

/**
 * Trainer's hours breakdown (for detailed view)
 */
export type TrainerHours = {
  trainerName: string;
  hoursByTimeSlot: Record<string, number>; // e.g., { "18:30": 4.0, "10:00": 11.0 }
  totalHours: number;
  sessionCount: number;    // Number of sessions attended
};

/**
 * Payment for one trainer in one group
 */
export type TrainerPayment = {
  trainerName: string;
  totalHours: number;
  totalPayment: number;
  groupName: string;
};

// ============================================
// Results Types
// ============================================

/**
 * Warning reasons for skipped rows
 */
export type WarningReason = 'MISSING_TIME' | 'MISSING_TOTALS' | 'MISSING_DATE' | 'INVALID_TOTALS';

/**
 * Processing warning for skipped rows
 */
export type ProcessingWarning = {
  row: number;
  reason: WarningReason;
  message: string;
};

/**
 * Results for one processed group
 */
export type GroupResults = {
  groupName: string;
  pricePerHour: number;
  trainerPayments: TrainerPayment[];
  trainerHours: TrainerHours[];  // For detailed breakdown view
  totalHours: number;
  totalPayment: number;
  processedAt: string;     // ISO date string
  warnings: ProcessingWarning[];
  sessionCount: number;    // Total sessions processed
};

/**
 * Accumulated results across all groups
 */
export type CombinedResults = {
  groups: GroupResults[];
  trainerTotals: Record<string, { hours: number; payment: number }>;
  grandTotalHours: number;
  grandTotalPayment: number;
};

// ============================================
// Application State Types
// ============================================

/**
 * Application step/screen
 */
export type AppStep = 'upload' | 'configure' | 'results' | 'combined';

/**
 * Parsed file data (before configuration)
 */
export type ParsedFileData = {
  sessions: TrainingSession[];
  timeSlots: string[];           // Unique time slots detected
  trainerNames: string[];        // Trainer names from headers
  warnings: ProcessingWarning[];
  fileName: string;
};

/**
 * Main application state
 */
export type AppState = {
  currentStep: AppStep;
  currentGroupName: string;
  currentPricePerHour: number | null;
  parsedData: ParsedFileData | null;
  timeSlotConfigs: TimeSlotConfig[];
  currentGroupResults: GroupResults | null;
  accumulatedResults: CombinedResults;
  savedConfigs: GroupConfig[];
  isProcessing: boolean;
  error: string | null;
};

/**
 * Initial empty combined results
 */
export const INITIAL_COMBINED_RESULTS: CombinedResults = {
  groups: [],
  trainerTotals: {},
  grandTotalHours: 0,
  grandTotalPayment: 0,
};

/**
 * Initial application state
 */
export const INITIAL_APP_STATE: AppState = {
  currentStep: 'upload',
  currentGroupName: '',
  currentPricePerHour: null,
  parsedData: null,
  timeSlotConfigs: [],
  currentGroupResults: null,
  accumulatedResults: INITIAL_COMBINED_RESULTS,
  savedConfigs: [],
  isProcessing: false,
  error: null,
};
