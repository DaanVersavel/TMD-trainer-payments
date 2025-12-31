# 📋 Trainer Payment Calculator - Implementation Plan (VALIDATED)

## 🎯 Project Overview
A web-based TypeScript application that calculates trainer payments based on attendance records from Excel files, with flexible configuration for duration and pricing. The application processes one training group at a time while accumulating results across multiple groups.

**Payment Model:** Hours are **split equally** among trainers present per session (budget-sharing model).

---

## ✅ Business Rules Clarified

### Calculation Model
- **Hours split among trainers:** If 2 trainers attend a 2-hour session, each gets 1 hour credited
- **Formula:** `hours_per_trainer = session_duration / trainers_present`
- **Rationale:** Fixed budget per session shared among attending trainers

### Data Requirements
- **Trainer presence:** Only "Trainer (1)" indicates presence; empty cells mean absent
- **No validation needed for Totals column:** Excel only shows "Trainer (1)" when present
- **Trainer names:** Always consistent across files (exact match)
- **Attendance:** Always full hours (no partial attendance)
- **Totals column:** Always whole numbers (1, 2, 3...)
- **Time format:** Always HH:MM (e.g., "18:30")

### File Specifications
- **Size:** ~20 sessions per file
- **Trainers:** Maximum 5 trainers per group
- **One file per group:** U10, U12, U19, etc.

### Edge Case Handling
- **Trainer with 0 hours:** Show as blank/hidden in results
- **Missing Event time:** Skip row, add to remarks/warnings
- **Missing Totals:** Skip row, add to remarks/warnings
- **Missing data:** Skip row silently with warning counter

### Configuration Behavior
- **Auto-fill:** Everything (durations + price) when group name matches saved config
- **Editing processed groups:** User can delete or edit previously processed groups
- **Validation:** Unit tests will verify calculation accuracy

---

## 🏗️ Architecture

### Technology Stack
- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **File Processing:** xlsx library
- **Storage:** localStorage for saving configurations
- **State Management:** React hooks (useState, useReducer, useContext)

### Project Structure
```
trainer-payment-calculator/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx           # File upload component
│   │   ├── GroupConfiguration.tsx   # Duration config per time slot
│   │   ├── PriceConfiguration.tsx   # Single price input per group
│   │   ├── ProcessingStatus.tsx     # Progress indicator
│   │   ├── GroupResults.tsx         # Results for one group
│   │   ├── CombinedResults.tsx      # Accumulated results across groups
│   │   ├── DetailedBreakdown.tsx    # Debug statistics
│   │   ├── ValidationWarnings.tsx   # Warning display (skipped rows)
│   │   └── GroupManager.tsx         # Edit/delete processed groups
│   ├── services/
│   │   ├── excelParser.ts           # Parse Excel files
│   │   ├── paymentCalculator.ts     # Core calculation logic
│   │   ├── validator.ts             # Data validation
│   │   └── storageService.ts        # localStorage management
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── utils/
│   │   └── helpers.ts               # Utility functions
│   ├── hooks/
│   │   └── useAppState.ts           # Custom state management hook
│   ├── App.tsx                      # Main application
│   └── main.tsx                     # Entry point
├── __tests__/
│   ├── paymentCalculator.test.ts    # Unit tests for calculations
│   ├── excelParser.test.ts          # Unit tests for parsing
│   └── validator.test.ts            # Unit tests for validation
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts                 # Test configuration
└── tailwind.config.js
```

---

## 📊 Data Flow

### Step 1: File Upload
**User Action:** Upload Excel file for one training group

**Processing:**
1. Parse Excel file
2. Extract columns: Datum activiteit, Event time, Event name, Totals, [Trainer columns]
3. Identify unique time slots (e.g., "18:30", "10:00")
4. Detect trainer names from column headers (only those with "Trainer (1)" values)
5. Check localStorage for saved configurations
6. Count skipped rows (missing data) for warnings

### Step 2: Configuration (SIMPLIFIED)
**User Input:**
- **Group name:** e.g., "U19"
- **Price per hour:** Single value for entire group (e.g., 15€)
- **Duration per time slot:**
  - Time Slot 18:30: [2.0] hours
  - Time Slot 10:00: [1.5] hours

**Auto-fill from saved configs if available (everything pre-populated)**

### Step 3: Calculation
**For each training session:**
1. Get session duration from configuration (based on Event time)
2. Get number of trainers present (Totals column)
3. Calculate hours per trainer: `duration / totals` ← **SPLIT HOURS MODEL**
4. For each trainer marked as "Trainer (1)":
   - Add calculated hours to their total
5. Skip rows with missing Event time or Totals (track in warnings)

**Example:**
- Session: 18:30, Duration: 2h, Totals: 2, Price: 15€/h
- Trainer A present, Trainer B present
- Each gets: 2h / 2 = 1 hour credited ← **HOURS ARE SPLIT**
- Payment per trainer: 1h × 15€ = 15€

### Step 4: Display Results
**Three Views:**

**A) Current Group Results:**
- Trainer payments for just-processed group
- Hide trainers with 0 hours
- Detailed breakdown available
- Option to add another group OR finish

**B) Combined Results (Accumulated):**
- Sum of all trainers across all processed groups
- Final total amounts per trainer (exact name matching)
- Grand total across all groups
- Edit/Delete functionality for individual groups

**C) Warnings/Remarks:**
- Count of skipped rows
- Reasons for skipping (missing time, missing totals)

### Step 5: Persistence
- Save group configuration to localStorage (auto-fill everything)
- Keep accumulated results in app state
- Edit or delete processed groups
- Clear option resets everything

---

## 🔧 Core Data Structures

```typescript
// Configuration for a time slot (duration only)
type TimeSlotConfig = {
  timeSlot: string;        // e.g., "18:30" (always HH:MM format)
  duration: number;        // in hours, e.g., 2.0 (always whole or .5)
}

// Full group configuration (saved to localStorage)
type GroupConfig = {
  groupName: string;       // e.g., "U10"
  pricePerHour: number;    // e.g., 15
  timeSlots: TimeSlotConfig[];
  lastUsed: string;        // ISO date string
}

// Training session from Excel
type TrainingSession = {
  date: string;            // "04/11/2025"
  time: string;            // "18:30" (always HH:MM)
  eventName: string;       // "U10 - Training"
  totals: number;          // 2 (always integer)
  trainersPresent: string[]; // ["Verpeten Kimi", "Wagener Senne"]
}

// Trainer's hours breakdown
type TrainerHours = {
  trainerName: string;
  hoursByTimeSlot: Map<string, number>; // For debugging view
  totalHours: number;
  sessionCount: number;    // Number of sessions attended
}

// Payment for one group
type TrainerPayment = {
  trainerName: string;
  totalHours: number;
  totalPayment: number;
  groupName: string;
}

// Results for one processed group
type GroupResults = {
  groupName: string;
  pricePerHour: number;
  trainerPayments: TrainerPayment[];
  totalHours: number;
  totalPayment: number;
  processedAt: string;     // ISO date string
  warnings: ProcessingWarning[];
}

// Processing warnings
type ProcessingWarning = {
  row: number;
  reason: 'MISSING_TIME' | 'MISSING_TOTALS' | 'MISSING_DATE';
  message: string;
}

// Accumulated results across all groups
type CombinedResults = {
  groups: GroupResults[];
  trainerTotals: Map<string, { hours: number; payment: number }>;
  grandTotalHours: number;
  grandTotalPayment: number;
}

// App state
type AppState = {
  currentGroup: GroupResults | null;
  accumulatedResults: GroupResults[];
  savedConfigs: GroupConfig[];
  currentStep: 'upload' | 'configure' | 'results' | 'combined';
}
```

---

## ⚙️ Key Functions

### 1. File Parsing (`excelParser.ts`)

```typescript
/**
 * Parse Excel file and extract training sessions
 * Skips rows with missing Event time or Totals
 * @param file - The uploaded Excel file
 * @returns Object with sessions and warnings
 */
export async function parseExcelFile(file: File): Promise<{
  sessions: TrainingSession[];
  warnings: ProcessingWarning[];
}>

/**
 * Detect unique time slots from sessions
 * @param sessions - Array of training sessions
 * @returns Array of unique time slots sorted (HH:MM format)
 */
export function detectTimeSlots(sessions: TrainingSession[]): string[]

/**
 * Extract trainer names from Excel columns
 * Only includes trainers who have at least one "Trainer (1)" entry
 * @param file - The uploaded Excel file
 * @returns Array of trainer names (exact strings from headers)
 */
export async function extractTrainerNames(file: File): Promise<string[]>
```

### 2. Payment Calculation (`paymentCalculator.ts`)

```typescript
/**
 * Calculate hours per trainer based on sessions and configurations
 * Uses SPLIT HOURS model: hours_per_trainer = duration / totals
 * @param sessions - Training sessions
 * @param timeSlotConfigs - Time slot duration configurations
 * @returns Trainer hours breakdown
 */
export function calculateTrainerHours(
  sessions: TrainingSession[], 
  timeSlotConfigs: TimeSlotConfig[]
): TrainerHours[]

/**
 * Calculate payments for trainers
 * Filters out trainers with 0 total hours
 * @param trainerHours - Calculated hours per trainer
 * @param pricePerHour - Price per hour for the group
 * @param groupName - Name of the group
 * @returns Trainer payment details (excluding 0-hour trainers)
 */
export function calculatePayments(
  trainerHours: TrainerHours[],
  pricePerHour: number,
  groupName: string
): TrainerPayment[]

/**
 * Accumulate results across multiple groups
 * Uses exact string matching for trainer names
 * @param existingResults - Previously accumulated results
 * @param newGroupResults - New group to add
 * @returns Updated combined results
 */
export function accumulateResults(
  existingResults: CombinedResults,
  newGroupResults: GroupResults
): CombinedResults

/**
 * Remove a processed group from accumulated results
 * Recalculates trainer totals
 * @param results - Current combined results
 * @param groupName - Name of group to remove
 * @returns Updated combined results
 */
export function removeGroup(
  results: CombinedResults,
  groupName: string
): CombinedResults
```

### 3. Validation (`validator.ts`)

```typescript
/**
 * Validate parsed Excel data
 * @param sessions - Parsed training sessions
 * @returns Array of validation warnings (non-blocking)
 */
export function validateSessions(sessions: TrainingSession[]): ProcessingWarning[]

/**
 * Validate group configuration
 * @param config - Group configuration to validate
 * @returns True if valid, error message if invalid
 */
export function validateConfiguration(config: GroupConfig): { 
  valid: boolean; 
  error?: string 
}

/**
 * Validate time format (must be HH:MM)
 * @param time - Time string to validate
 * @returns True if valid
 */
export function isValidTimeFormat(time: string): boolean
```

### 4. Storage Service (`storageService.ts`)

```typescript
/**
 * Save group configuration to localStorage
 * Overwrites existing config with same group name
 * @param config - Configuration to save
 */
export function saveGroupConfig(config: GroupConfig): void

/**
 * Load group configuration from localStorage
 * @param groupName - Name of group to load
 * @returns Configuration if found, null otherwise
 */
export function loadGroupConfig(groupName: string): GroupConfig | null

/**
 * Get all saved configurations
 * @returns Array of all saved configurations
 */
export function getAllConfigs(): GroupConfig[]

/**
 * Delete a saved configuration
 * @param groupName - Name of configuration to delete
 */
export function deleteConfig(groupName: string): void

/**
 * Clear all saved configurations
 */
export function clearAllConfigs(): void
```

---

## 🎨 User Interface Workflow

### Screen 1: Upload & Configuration
```
┌─────────────────────────────────────────────┐
│  Trainer Payment Calculator                 │
├─────────────────────────────────────────────┤
│  📁 Upload Training Group Data              │
│                                             │
│  Group Name: [U10____________]              │
│  ℹ️  Auto-fills if previously saved         │
│                                             │
│  Price per Hour: [15___] €                  │
│  ℹ️  Auto-fills from saved config           │
│                                             │
│  Upload Excel File:                         │
│  ┌─────────────────────────┐               │
│  │  Drop file here or      │               │
│  │  [Choose File]          │               │
│  └─────────────────────────┘               │
│                                             │
│  📊 Processed Groups: 0                     │
│                                             │
│                [Next →]                     │
└─────────────────────────────────────────────┘
```

### Screen 2: Time Slot Duration Configuration
```
┌─────────────────────────────────────────────┐
│  Configure Time Slots - U10                 │
│  Price per Hour: 15€                        │
├─────────────────────────────────────────────┤
│  Detected 2 unique time slots:              │
│                                             │
│  ⏰ Time Slot: 18:30 (7 sessions)           │
│     Duration: [2.0] hours                   │
│                                             │
│  ⏰ Time Slot: 10:00 (6 sessions)           │
│     Duration: [1.5] hours                   │
│                                             │
│  ℹ️  Auto-filled from saved configuration   │
│  ⚠️  2 rows skipped (missing data)          │
│                                             │
│  [← Back]  [Calculate Payments →]          │
└─────────────────────────────────────────────┘
```

### Screen 3: Group Results
```
┌─────────────────────────────────────────────┐
│  Payment Results - U10                      │
│  Rate: 15€/hour | Model: Split Hours       │
├─────────────────────────────────────────────┤
│  💰 Trainer Payments                        │
│                                             │
│  Van Acker Maxime      15.0h      225.0€   │
│  Verpeten Kimi         19.5h      292.5€   │
│  Wagener Senne         18.0h      270.0€   │
│                                             │
│  ─────────────────────────────────────────  │
│  GROUP TOTAL:          52.5h      787.5€   │
│                                             │
│  ⚠️  Warnings: 2 rows skipped               │
│  [View Warnings]                            │
│                                             │
│  [View Details] [Process Another Group]    │
│                 [View Combined Results →]   │
└─────────────────────────────────────────────┘
```

### Screen 4: Combined Results (Accumulated)
```
┌─────────────────────────────────────────────┐
│  Combined Results - All Groups              │
│  Groups Processed: U10, U12, U19            │
├─────────────────────────────────────────────┤
│  💰 Total Payments per Trainer              │
│                                             │
│  Van Acker Maxime      45.0h      675.0€   │
│  Verpeten Kimi         58.5h      877.5€   │
│  Wagener Senne         52.0h      780.0€   │
│  De Bruyne Kevin       30.0h      450.0€   │
│  Martinez Luis         25.5h      382.5€   │
│                                             │
│  ─────────────────────────────────────────  │
│  GRAND TOTAL:         211.0h     3165.0€   │
│                                             │
│  📊 Breakdown by Group:                     │
│  ├─ U10:  52.5h   787.5€  [Edit] [Delete] │
│  ├─ U12:  78.0h  1170.0€  [Edit] [Delete] │
│  └─ U19:  80.5h  1207.5€  [Edit] [Delete] │
│                                             │
│  [View Group Details] [Start Over]         │
│  [Process Another Group]                   │
└─────────────────────────────────────────────┘
```

### Screen 5: Warnings View
```
┌─────────────────────────────────────────────┐
│  Processing Warnings - U10                  │
├─────────────────────────────────────────────┤
│  ⚠️  2 rows were skipped during processing  │
│                                             │
│  Row 15: Missing Event time                │
│  → Session could not be processed          │
│                                             │
│  Row 23: Missing Totals value              │
│  → Unable to calculate trainer hours       │
│                                             │
│  ℹ️  These rows were excluded from          │
│     calculations. Check your Excel file    │
│     if you believe this is an error.       │
│                                             │
│  [← Back to Results]                        │
└─────────────────────────────────────────────┘
```

### Screen 6: Edit Group Dialog
```
┌─────────────────────────────────────────────┐
│  Edit Group - U10                           │
├─────────────────────────────────────────────┤
│  ⚠️  This will recalculate all payments    │
│                                             │
│  Price per Hour: [15___] €                  │
│                                             │
│  Time Slot Durations:                       │
│  ⏰ 18:30: [2.0] hours                      │
│  ⏰ 10:00: [1.5] hours                      │
│                                             │
│  [Cancel]  [Save & Recalculate]            │
└─────────────────────────────────────────────┘
```

### Screen 7: Detailed Breakdown (Debug View)
```
┌─────────────────────────────────────────────┐
│  Detailed Breakdown - U10                   │
│  Rate: 15€/hour | Model: Split Hours       │
├─────────────────────────────────────────────┤
│  📊 Van Acker Maxime                        │
│  ├─ Sessions attended: 15                   │
│  ├─ Time slot breakdown:                    │
│  │   ⏰ 18:30 (2.0h, split): 4.0h          │
│  │      • 8 sessions, avg 2 trainers/sess  │
│  │   ⏰ 10:00 (1.5h, split): 11.0h         │
│  │      • 7 sessions, avg 1.5 trainers/sess│
│  ├─ Total hours: 15.0h                      │
│  └─ Total payment: 225.0€                   │
│                                             │
│  📊 Verpeten Kimi                           │
│  ├─ Sessions attended: 13                   │
│  ├─ Time slot breakdown:                    │
│  │   ⏰ 18:30 (2.0h, split): 7.0h          │
│  │   ⏰ 10:00 (1.5h, split): 12.5h         │
│  ├─ Total hours: 19.5h                      │
│  └─ Total payment: 292.5€                   │
│                                             │
│  ℹ️  "Split" means hours divided by         │
│     number of trainers present             │
│                                             │
│  [← Back to Results]                        │
└─────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

#### `paymentCalculator.test.ts`
```typescript
describe('calculateTrainerHours - Split Hours Model', () => {
  test('2 trainers share 2-hour session → each gets 1 hour', () => {
    // Given: Session with 2h duration, 2 trainers present
    // When: Calculate hours
    // Then: Each trainer should have 1 hour credited
  });
  
  test('1 trainer alone in 2-hour session → gets 2 hours', () => {
    // Given: Session with 2h duration, 1 trainer present
    // When: Calculate hours
    // Then: Trainer should have 2 hours credited
  });
  
  test('3 trainers share 3-hour session → each gets 1 hour', () => {
    // Verifies: hours = duration / totals
  });
  
  test('trainer with mixed sessions calculates correctly', () => {
    // Given: Multiple sessions with varying trainers present
    // When: Calculate total hours
    // Then: Sum should match manual calculation
  });
  
  test('trainer with 0 hours is filtered out', () => {
    // Given: Trainer never marked as present
    // When: Calculate payments
    // Then: Trainer should not appear in results
  });
});

describe('accumulateResults', () => {
  test('same trainer across 2 groups accumulates correctly', () => {
    // Given: "Van Acker Maxime" in U10 (15h) and U12 (30h)
    // When: Accumulate results
    // Then: Combined total should be 45h
  });
  
  test('different trainers in different groups', () => {
    // Verifies: All trainers appear in combined results
  });
});

describe('removeGroup', () => {
  test('removing middle group recalculates correctly', () => {
    // Given: 3 groups processed
    // When: Remove middle group
    // Then: Totals should reflect only remaining 2 groups
  });
});
```

#### `excelParser.test.ts`
```typescript
describe('parseExcelFile', () => {
  test('skips rows with missing Event time', () => {
    // Given: Excel with 2 rows missing Event time
    // When: Parse file
    // Then: Should return warnings for 2 rows
  });
  
  test('skips rows with missing Totals', () => {
    // Verifies: Warnings generated for missing Totals
  });
  
  test('detects correct time slots', () => {
    // Given: Excel with "18:30" and "10:00" sessions
    // When: Detect time slots
    // Then: Should return ["10:00", "18:30"] sorted
  });
  
  test('extracts trainer names from headers', () => {
    // Verifies: Only trainers with "Trainer (1)" values included
  });
});
```

#### `validator.test.ts`
```typescript
describe('isValidTimeFormat', () => {
  test('accepts HH:MM format', () => {
    expect(isValidTimeFormat('18:30')).toBe(true);
    expect(isValidTimeFormat('09:15')).toBe(true);
  });
  
  test('rejects invalid formats', () => {
    expect(isValidTimeFormat('18:30:00')).toBe(false);
    expect(isValidTimeFormat('6:30 PM')).toBe(false);
    expect(isValidTimeFormat('18h30')).toBe(false);
  });
});

describe('validateConfiguration', () => {
  test('rejects empty group name', () => {
    // Verifies: Error returned for blank name
  });
  
  test('rejects zero or negative price', () => {
    // Verifies: Price must be > 0
  });
  
  test('rejects zero or negative duration', () => {
    // Verifies: Duration must be > 0
  });
});
```

### Integration Tests

```typescript
describe('Full Workflow - Single Group', () => {
  test('upload → configure → calculate → display results', async () => {
    // Given: Valid Excel file, group config
    // When: Process complete workflow
    // Then: Results match expected manual calculation
  });
});

describe('Full Workflow - Multiple Groups', () => {
  test('process 3 groups → view combined results', async () => {
    // Given: 3 different Excel files
    // When: Process all groups
    // Then: Combined totals match sum of individual groups
  });
  
  test('edit middle group → recalculate combined', async () => {
    // Given: 3 processed groups
    // When: Edit U12 configuration
    // Then: Combined results update correctly
  });
  
  test('delete group → recalculate combined', async () => {
    // Given: 3 processed groups
    // When: Delete U12
    // Then: Combined results reflect only U10 and U19
  });
});
```

### Manual Test Cases

| Test Case | Input | Expected Output | Status |
|-----------|-------|----------------|--------|
| Standard calculation | Excel with 20 sessions, 3 trainers | Payments match manual calculation | ⏳ |
| Split hours verification | 2h session, 2 trainers | Each gets 1h | ⏳ |
| Auto-fill config | Enter "U10" (saved before) | Price and durations pre-filled | ⏳ |
| Missing data warnings | Excel with 2 missing Event times | 2 warnings displayed | ⏳ |
| Edit processed group | Change U10 price from 15€ to 20€ | Payments recalculated, combined updated | ⏳ |
| Delete processed group | Remove U12 from 3-group results | Combined shows only U10 + U19 | ⏳ |

---

## 🎯 Validation Checklist

### File Parsing ✅
- [x] Excel file format validation (.xlsx)
- [x] Required columns present
- [x] At least one trainer column exists
- [x] Skips rows with missing Event time (warnings)
- [x] Skips rows with missing Totals (warnings)

### Data Validation ✅
- [x] Time format is HH:MM
- [x] Totals is integer > 0
- [x] Duration > 0 for all time slots
- [x] Trainer names are strings (exact match)

### Configuration Validation ✅
- [x] Group name is not empty
- [x] Price per hour > 0
- [x] All detected time slots have configuration

### Edge Cases ✅
- [x] Trainer with 0 hours → hidden from results
- [x] Missing Event time → skip row, add warning
- [x] Missing Totals → skip row, add warning
- [x] Last row summary handling
- [x] localStorage full → show error message

---

## 🚀 Development Phases

### Phase 1: Setup & Core Logic (Days 1-2)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Set up Tailwind CSS and Vitest
- [ ] Implement TypeScript types (`types/index.ts`)
- [ ] Implement Excel parsing with warning tracking (`excelParser.ts`)
- [ ] Implement SPLIT HOURS calculation logic (`paymentCalculator.ts`)
- [ ] Implement localStorage service (`storageService.ts`)
- [ ] Write unit tests for calculations (verify split hours model)
- [ ] Test with example file (manual calculation verification)

**Deliverable:** Core logic working with passing unit tests

### Phase 2: Basic UI & Single Group Processing (Days 3-4)
- [ ] Create FileUpload component (drag & drop)
- [ ] Create GroupConfiguration component (name + price, auto-fill)
- [ ] Create TimeSlotConfiguration component (durations, auto-fill)
- [ ] Create GroupResults component (single group view, hide 0-hour trainers)
- [ ] Create ValidationWarnings component (skipped rows display)
- [ ] Implement validation feedback
- [ ] Test full workflow with UI

**Deliverable:** Working single-group processing with UI

### Phase 3: Multi-Group Accumulation (Days 5-6)
- [ ] Implement state management for accumulated results
- [ ] Create CombinedResults component
- [ ] Implement "Process Another Group" workflow
- [ ] Implement Edit Group functionality (recalculate on save)
- [ ] Implement Delete Group functionality
- [ ] Add "Start Over" with confirmation dialog
- [ ] Test with multiple group files
- [ ] Verify exact name matching for accumulation

**Deliverable:** Full multi-group functionality with edit/delete

### Phase 4: Advanced Features & Polish (Days 7-8)
- [ ] Implement DetailedBreakdown view (show split hours model)
- [ ] Add loading states and animations
- [ ] Improve error messages and validation feedback
- [ ] Add configuration management UI (view/edit/delete saved configs)
- [ ] Responsive design for mobile/tablet
- [ ] Add help/instructions section (explain split hours model)
- [ ] Add confirmation dialogs (delete, start over, edit)
- [ ] Final testing and bug fixes
- [ ] Manual calculation verification for all test cases

**Deliverable:** Production-ready application

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "xlsx": "^0.18.5"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.5.3",
  "vite": "^5.3.1",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0",
  "tailwindcss": "^3.4.4",
  "autoprefixer": "^10.4.19",
  "postcss": "^8.4.39",
  "@vitejs/plugin-react": "^4.3.1",
  "vitest": "^1.6.0",
  "@testing-library/react": "^16.0.0",
  "@testing-library/jest-dom": "^6.4.6"
}
```

---

## 🎉 Final Application Features

✅ Upload Excel file per group (~20 sessions, max 5 trainers)  
✅ Configure time slots (duration) + single price per group  
✅ Auto-save and auto-fill ALL configurations (price + durations)  
✅ Process one group at a time  
✅ **Split hours model:** Hours divided by trainers present  
✅ Accumulate results across multiple groups (exact name matching)  
✅ Hide trainers with 0 hours  
✅ Skip rows with missing data (with warnings)  
✅ View individual group results  
✅ View combined results (all groups)  
✅ **Edit processed groups** (recalculate and update combined)  
✅ **Delete processed groups** (update combined results)  
✅ Detailed breakdown view (show split hours breakdown)  
✅ Validation with clear warning messages  
✅ Confirmation dialogs for destructive actions  
✅ Start over / clear all data  
✅ Responsive web interface  
✅ localStorage persistence  
✅ Clean, professional UI with Tailwind CSS  
✅ Unit tested calculations with 100% accuracy

---

## 📝 Implementation Notes

### Excel File Format
- **Columns:** Datum activiteit, Event time, Event name, Totals, [Trainer columns]
- **Trainer presence:** "Trainer (1)" = present, empty = absent
- **Time format:** Always HH:MM (e.g., "18:30")
- **Totals:** Always integers (1, 2, 3...)
- **Trainer names:** Exact strings (consistent across files)
- **Missing data:** Rows skipped, warnings tracked

### Calculation Logic (SPLIT HOURS MODEL)
```typescript
For each session:
  session_duration = timeSlotConfig[session.time].duration
  trainers_present = session.totals
  hours_per_trainer = session_duration / trainers_present  // ← SPLIT HOURS
  
  For each trainer marked "Trainer (1)":
    trainer.hours += hours_per_trainer
    
Filter out trainers with totalHours === 0

Total payment = trainer.totalHours * pricePerHour
```

**Example Calculation:**
```
Session 1: 18:30, 2h duration, 2 trainers (A, B)
→ A gets 1h, B gets 1h

Session 2: 10:00, 1.5h duration, 3 trainers (A, B, C)
→ A gets 0.5h, B gets 0.5h, C gets 0.5h

Trainer A total: 1h + 0.5h = 1.5h
If price = 15€/h → Payment = 1.5h × 15€ = 22.5€
```

### Configuration Auto-Fill Behavior
When user enters a group name (e.g., "U10"):
1. Check localStorage for saved config
2. If found: Pre-fill **both** price AND time slot durations
3. User can modify any field before processing
4. On submit: Save updated config to localStorage

### Edit/Delete Functionality
**Edit Group:**
1. User clicks [Edit] on processed group in Combined Results
2. Modal shows current configuration (price, durations)
3. User modifies values
4. On Save: Recalculate that group's payments
5. Update combined results (recalculate trainer totals)

**Delete Group:**
1. User clicks [Delete] on processed group
2. Confirmation dialog: "Remove U10 from results?"
3. On Confirm: Remove group from accumulated results
4. Recalculate combined trainer totals
5. Update grand totals

### Warning System
Track skipped rows during parsing:
- Row number
- Reason (missing time, missing totals, missing date)
- Display count in results: "⚠️ 2 rows skipped"
- Clickable to view details

### Error Handling
- **File parsing errors:** "Invalid Excel format. Please upload .xlsx file"
- **Validation errors:** "Configuration incomplete. Please set duration for all time slots"
- **Missing configuration:** "Please fill in all required fields"
- **localStorage full:** "Cannot save configuration. Storage limit reached. Please clear old configurations."

---

## ✨ Success Criteria

The application is successful when:
1. ✅ User can upload Excel file and see accurate payment calculations (SPLIT HOURS)
2. ✅ Configuration auto-fills everything (price + durations) for known groups
3. ✅ Multiple groups can be processed and accumulated correctly (exact name matching)
4. ✅ Edit/delete functionality updates combined results accurately
5. ✅ Warnings track skipped rows with clear messages
6. ✅ Trainers with 0 hours are hidden from results
7. ✅ All validation catches data errors effectively
8. ✅ UI is intuitive and responsive
9. ✅ No data loss during workflow (state management works)
10. ✅ Performance is smooth (no lag during calculations)
11. ✅ **All calculations verified with unit tests and manual verification**
12. ✅ Confirmation dialogs prevent accidental data loss

---

## 🔒 Business Rule Summary

| Rule | Implementation |
|------|----------------|
| Hours model | **Split among trainers:** `hours = duration / totals` |
| Trainer presence | Only "Trainer (1)" = present; empty = absent |
| Name matching | Exact string match (case-sensitive) |
| Attendance | Always full hours (no partial attendance) |
| Time format | Always HH:MM (e.g., "18:30") |
| Totals column | Always integers (1, 2, 3...) |
| Zero-hour trainers | Hidden from results (not displayed) |
| Missing data | Skip row, add warning (non-blocking) |
| Auto-fill | Everything (price + all durations) |
| Edit groups | Recalculate and update combined results |
| Delete groups | Remove and recalculate combined results |

---

**Implementation Ready with Full Validation! 🚀**

All ambiguities resolved. All business rules documented. Ready to build with confidence!
