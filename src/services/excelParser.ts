import * as XLSX from 'xlsx';
import type { TrainingSession, ProcessingWarning, ExcelRow, ParsedFileData } from '../types';
import { isValidTimeFormat, normalizeTime, parseTotals } from './validator';

// Known column names
const COL_DATE = 'Datum activiteit';
const COL_TIME = 'Event time';
const COL_EVENT_NAME = 'Event name';
const COL_TOTALS = 'Totals';
const TRAINER_MARKER = 'Trainer (1)';

/**
 * Parse Excel file and extract all data needed for processing
 */
export async function parseExcelFile(file: File): Promise<ParsedFileData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Get the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON with header row
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: '' });

  if (rows.length === 0) {
    return {
      sessions: [],
      timeSlots: [],
      trainerNames: [],
      warnings: [{ row: 0, reason: 'MISSING_DATE', message: 'Excel file is empty or has no data rows' }],
      fileName: file.name,
    };
  }

  // Extract trainer names from column headers
  const trainerNames = extractTrainerNamesFromRows(rows);

  // Parse sessions and collect warnings
  const { sessions, warnings } = parseSessionsFromRows(rows, trainerNames);

  // Detect unique time slots
  const timeSlots = detectTimeSlots(sessions);

  return {
    sessions,
    timeSlots,
    trainerNames,
    warnings,
    fileName: file.name,
  };
}

/**
 * Extract trainer names from Excel column headers
 * Only includes trainers who have at least one "Trainer (1)" entry
 */
function extractTrainerNamesFromRows(rows: ExcelRow[]): string[] {
  if (rows.length === 0) return [];

  // Get all column names from first row
  const firstRow = rows[0];
  const allColumns = Object.keys(firstRow);

  // Known non-trainer columns
  const excludedColumns = new Set([COL_DATE, COL_TIME, COL_EVENT_NAME, COL_TOTALS]);

  // Find columns that have at least one "Trainer (1)" value
  const trainerColumns: string[] = [];

  for (const col of allColumns) {
    if (excludedColumns.has(col)) continue;

    // Check if any row has "Trainer (1)" in this column
    const hasTrainerMarker = rows.some(
      (row) => String(row[col]).trim() === TRAINER_MARKER
    );

    if (hasTrainerMarker) {
      trainerColumns.push(col);
    }
  }

  return trainerColumns;
}

/**
 * Parse training sessions from Excel rows
 */
function parseSessionsFromRows(
  rows: ExcelRow[],
  trainerNames: string[]
): { sessions: TrainingSession[]; warnings: ProcessingWarning[] } {
  const sessions: TrainingSession[] = [];
  const warnings: ProcessingWarning[] = [];

  let consecutiveEmptyRows = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because: index starts at 0, and row 1 is header

    // Check for completely empty row
    const date = String(row[COL_DATE] || '').trim();
    const rawTime = String(row[COL_TIME] || '').trim();
    const eventName = String(row[COL_EVENT_NAME] || '').trim();
    
    // Skip summary/total rows (e.g. "Totaal" row at the end)
    if (!date && !rawTime && eventName.toLowerCase().startsWith('totaal')) {
      continue;
    }

    // Check if row is completely empty (no date, time, or event name)
    if (!date && !rawTime && !eventName) {
      consecutiveEmptyRows++;
      
      // Stop processing after 2 consecutive empty rows (end of data section)
      if (consecutiveEmptyRows >= 2) {
        break;
      }
      
      // Skip single empty row and continue (common in Excel files)
      continue;
    }
    
    // Reset counter when we find a data row
    consecutiveEmptyRows = 0;
    
    // Validate date
    if (!date) {
      warnings.push({
        row: rowNumber,
        reason: 'MISSING_DATE',
        message: `Row ${rowNumber}: Missing date (Datum activiteit)`,
      });
      continue;
    }

    // Validate time
    if (!rawTime) {
      warnings.push({
        row: rowNumber,
        reason: 'MISSING_TIME',
        message: `Row ${rowNumber}: Missing event time`,
      });
      continue;
    }

    const normalizedTime = normalizeTime(rawTime);
    if (!isValidTimeFormat(normalizedTime)) {
      warnings.push({
        row: rowNumber,
        reason: 'MISSING_TIME',
        message: `Row ${rowNumber}: Invalid time format "${rawTime}". Expected HH:MM`,
      });
      continue;
    }

    // Get trainers present
    const trainersPresent: string[] = [];
    for (const trainerName of trainerNames) {
      const value = String(row[trainerName] || '').trim();
      if (value === TRAINER_MARKER) {
        trainersPresent.push(trainerName);
      }
    }

    // Validate totals - if column is missing, auto-calculate from trainers present
    const hasTotalsColumn = COL_TOTALS in row;
    let totals: number | null;

    if (hasTotalsColumn) {
      totals = parseTotals(row[COL_TOTALS]);
      if (totals === null) {
        warnings.push({
          row: rowNumber,
          reason: 'MISSING_TOTALS',
          message: `Row ${rowNumber}: Missing or invalid Totals value`,
        });
        continue;
      }

      // Verify totals matches trainers present count
      if (trainersPresent.length !== totals) {
        console.warn(
          `Row ${rowNumber}: Totals (${totals}) doesn't match trainer count (${trainersPresent.length})`
        );
      }
    } else {
      // No Totals column - auto-calculate from trainers present
      totals = trainersPresent.length;
      if (totals === 0) {
        warnings.push({
          row: rowNumber,
          reason: 'MISSING_TOTALS',
          message: `Row ${rowNumber}: No trainers marked as present`,
        });
        continue;
      }
    }

    sessions.push({
      date,
      time: normalizedTime,
      eventName,
      totals,
      trainersPresent,
      rowNumber,
    });
  }

  return { sessions, warnings };
}

/**
 * Detect unique time slots from sessions
 * Returns sorted array of time slots in HH:MM format
 */
export function detectTimeSlots(sessions: TrainingSession[]): string[] {
  const uniqueTimeSlots = new Set(sessions.map((s) => s.time));
  return Array.from(uniqueTimeSlots).sort();
}

/**
 * Count sessions per time slot (for display purposes)
 */
export function countSessionsPerTimeSlot(
  sessions: TrainingSession[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const session of sessions) {
    counts[session.time] = (counts[session.time] || 0) + 1;
  }
  return counts;
}
