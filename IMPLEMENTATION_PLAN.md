# 📋 Trainer Payment Calculator - Implementation Plan (VALIDATED)

## 🎯 Project Overview
A web-based TypeScript application that calculates trainer payments based on attendance records from Excel files, with flexible configuration for duration and pricing. The application processes one training group at a time while accumulating results across multiple groups.

**Payment Model:** Hours are **split equally** among trainers present per session (budget-sharing model).

**UI Theme:** Dark mode

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
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Dark Mode)
- **File Processing:** xlsx library
- **Storage:** localStorage for saving configurations
- **State Management:** React hooks (useState, useReducer)
- **Testing:** Vitest

### Project Structure
```
trainer-payment-calculator/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx           ✅ File upload component
│   │   ├── GroupConfiguration.tsx   ✅ Group name + price config
│   │   ├── TimeSlotConfiguration.tsx ✅ Duration config per time slot
│   │   ├── ProcessingStatus.tsx     ✅ Progress indicator
│   │   ├── GroupResults.tsx         ✅ Results for one group
│   │   ├── CombinedResults.tsx      ✅ Accumulated results across groups
│   │   ├── DetailedBreakdown.tsx    ✅ Debug statistics
│   │   ├── ValidationWarnings.tsx   ✅ Warning display (skipped rows)
│   │   ├── EditGroupModal.tsx       ✅ Edit processed groups
│   │   └── index.ts                 ✅ Barrel exports
│   ├── services/
│   │   ├── excelParser.ts           ✅ Parse Excel files
│   │   ├── paymentCalculator.ts     ✅ Core calculation logic
│   │   ├── validator.ts             ✅ Data validation
│   │   ├── storageService.ts        ✅ localStorage management
│   │   └── index.ts                 ✅ Barrel exports
│   ├── types/
│   │   └── index.ts                 ✅ TypeScript types
│   ├── hooks/
│   │   └── useAppState.ts           ✅ Custom state management hook
│   ├── App.tsx                      ✅ Main application
│   ├── main.tsx                     ✅ Entry point
│   └── index.css                    ✅ Tailwind + Dark mode styles
├── __tests__/
│   ├── setup.ts                     ✅ Test setup
│   ├── paymentCalculator.test.ts    ✅ Unit tests for calculations
│   ├── excelParser.test.ts          ✅ Unit tests for parsing
│   └── validator.test.ts            ✅ Unit tests for validation
├── index.html                       ✅
├── package.json                     ✅
├── tsconfig.json                    ✅
├── vite.config.ts                   ✅
├── vitest.config.ts                 ✅
└── tailwind.config.js               ✅
```

---

## 🚀 Development Phases

### Phase 1: Setup & Core Logic (Days 1-2) ✅ COMPLETE
- [x] Initialize Vite + React + TypeScript project
- [x] Set up Tailwind CSS and Vitest
- [x] Implement TypeScript types (`types/index.ts`)
- [x] Implement Excel parsing with warning tracking (`excelParser.ts`)
- [x] Implement SPLIT HOURS calculation logic (`paymentCalculator.ts`)
- [x] Implement localStorage service (`storageService.ts`)
- [x] Implement validator service (`validator.ts`)
- [x] Write unit tests for calculations (verify split hours model)
- [x] Write unit tests for validation
- [x] Write unit tests for Excel parsing utilities

**Deliverable:** Core logic working with 43 passing unit tests ✅

### Phase 2: Basic UI & Single Group Processing (Days 3-4) ✅ COMPLETE
- [x] Create FileUpload component (drag & drop)
- [x] Create GroupConfiguration component (name + price, auto-fill)
- [x] Create TimeSlotConfiguration component (durations, auto-fill)
- [x] Create GroupResults component (single group view, hide 0-hour trainers)
- [x] Create ValidationWarnings component (skipped rows display)
- [x] Create ProcessingStatus component (loading spinner)
- [x] Implement useAppState hook for state management
- [x] Wire up App.tsx with step navigation
- [x] Implement validation feedback

**Deliverable:** Working single-group processing with UI ✅

### Phase 3: Multi-Group Accumulation (Days 5-6) ✅ COMPLETE
- [x] Implement state management for accumulated results
- [x] Create CombinedResults component (extracted from App.tsx)
- [x] Implement "Process Another Group" workflow
- [x] Implement Edit Group functionality (EditGroupModal)
- [x] Implement Delete Group functionality
- [x] Add "Start Over" with confirmation dialog
- [x] Implement DetailedBreakdown component (show split hours model)
- [x] Convert entire UI to Dark Mode

**Deliverable:** Full multi-group functionality with edit/delete in dark mode ✅

### Phase 4: Advanced Features & Polish (Days 7-8) 🔲 PENDING
- [ ] Add loading states and animations
- [ ] Improve error messages and validation feedback
- [ ] Add configuration management UI (view/edit/delete saved configs)
- [ ] Responsive design improvements for mobile/tablet
- [ ] Add help/instructions section (explain split hours model)
- [ ] Replace browser `confirm()` with custom confirmation modals
- [ ] Final testing and bug fixes
- [ ] Manual calculation verification for all test cases

**Deliverable:** Production-ready application

---

## 📊 Current Feature Status

### ✅ Completed Features
| Feature | Status | Component/File |
|---------|--------|----------------|
| Excel file upload (drag & drop) | ✅ | `FileUpload.tsx` |
| Excel parsing with warnings | ✅ | `excelParser.ts` |
| Split hours calculation | ✅ | `paymentCalculator.ts` |
| Time slot detection | ✅ | `excelParser.ts` |
| Group configuration | ✅ | `GroupConfiguration.tsx` |
| Time slot duration config | ✅ | `TimeSlotConfiguration.tsx` |
| Auto-fill from saved configs | ✅ | `useAppState.ts` |
| Save configs to localStorage | ✅ | `storageService.ts` |
| Single group results view | ✅ | `GroupResults.tsx` |
| Combined results view | ✅ | `CombinedResults.tsx` |
| Detailed breakdown view | ✅ | `DetailedBreakdown.tsx` |
| Validation warnings | ✅ | `ValidationWarnings.tsx` |
| Edit processed groups | ✅ | `EditGroupModal.tsx` |
| Delete processed groups | ✅ | `CombinedResults.tsx` |
| Start over functionality | ✅ | `useAppState.ts` |
| Dark mode UI | ✅ | All components |
| Unit tests (43 tests) | ✅ | `__tests__/` |

### 🔲 Pending Features (Phase 4)
| Feature | Status | Notes |
|---------|--------|-------|
| Configuration manager UI | 🔲 | View/delete saved configs |
| Help/instructions section | 🔲 | Explain split hours model |
| Custom confirmation modals | 🔲 | Replace browser `confirm()` |
| Loading animations | 🔲 | Smooth transitions |
| Mobile-optimized layout | 🔲 | Responsive improvements |

---

## 🧪 Test Coverage

### Unit Tests: 43 tests passing ✅

#### `paymentCalculator.test.ts` (15 tests)
- [x] Split hours model: 2 trainers share 2h → each gets 1h
- [x] Split hours model: 1 trainer alone gets full hours
- [x] Split hours model: 3 trainers share 3h → each gets 1h
- [x] Mixed sessions calculate correctly
- [x] Multiple sessions same time slot accumulate
- [x] Payment calculation with price
- [x] Trainer with 0 hours filtered out
- [x] Accumulate results across groups
- [x] Different trainers in different groups
- [x] Replace existing group on re-add
- [x] Remove group recalculates correctly
- [x] Remove last group returns initial state
- [x] roundHours utility
- [x] formatCurrency utility
- [x] formatHours utility

#### `validator.test.ts` (15 tests)
- [x] Valid time format HH:MM
- [x] Invalid time formats rejected
- [x] normalizeTime adds leading zero
- [x] Configuration validation - empty group name
- [x] Configuration validation - missing price
- [x] Configuration validation - zero/negative price
- [x] Configuration validation - empty time slots
- [x] Configuration validation - valid config
- [x] Time slot config validation
- [x] All time slots configured check
- [x] Missing slots detection
- [x] isValidTotals - positive integers
- [x] isValidTotals - numeric strings
- [x] isValidTotals - rejects invalid values
- [x] parseTotals utility

#### `excelParser.test.ts` (5 tests)
- [x] Detect unique sorted time slots
- [x] Empty sessions returns empty array
- [x] Single time slot handling
- [x] Count sessions per time slot
- [x] Empty sessions count

---

## 🎨 UI Screens Implemented

| Screen | Status | Description |
|--------|--------|-------------|
| Upload Screen | ✅ | Group name, price, file upload |
| Configure Screen | ✅ | Time slot durations, warnings preview |
| Results Screen | ✅ | Trainer payments, group totals |
| Combined Results | ✅ | All groups summary, edit/delete |
| Detailed Breakdown | ✅ | Hours per time slot per trainer |
| Edit Group Modal | ✅ | Edit price, recalculate |
| Warnings View | ✅ | Expandable skipped rows list |

---

## 📝 Implementation Notes

### Dark Mode Color Scheme
```css
Background:     bg-dark-950 (#020617)
Cards:          bg-dark-900 (#0f172a)
Inputs:         bg-dark-800 (#1e293b)
Borders:        border-dark-700 (#334155)
Text Primary:   text-gray-100
Text Secondary: text-gray-400
Text Muted:     text-gray-500
Accent Green:   text-green-400
Accent Blue:    text-blue-400
Accent Yellow:  text-yellow-400
Accent Red:     text-red-400
```

### State Management
Using `useReducer` pattern in `useAppState.ts`:
- `SET_STEP` - Navigate between screens
- `SET_GROUP_NAME` / `SET_PRICE` - Form inputs
- `SET_PARSED_DATA` - After file upload
- `SET_TIME_SLOT_CONFIGS` - Duration configuration
- `SET_GROUP_RESULTS` - After calculation
- `SET_ACCUMULATED_RESULTS` - Combined results
- `LOAD_CONFIG` - Auto-fill from saved
- `RESET_FOR_NEW_GROUP` - Start new group
- `RESET_ALL` - Clear everything

---

## ✨ Success Criteria

| Criteria | Status |
|----------|--------|
| Upload Excel and see accurate payments | ✅ |
| Auto-fill config for known groups | ✅ |
| Process multiple groups correctly | ✅ |
| Edit/delete updates combined results | ✅ |
| Warnings track skipped rows | ✅ |
| 0-hour trainers hidden | ✅ |
| Validation catches errors | ✅ |
| UI is intuitive | ✅ |
| No data loss during workflow | ✅ |
| Performance is smooth | ✅ |
| Unit tests verify calculations | ✅ |
| Confirmation dialogs prevent accidents | ⚠️ Using browser confirm() |

---

## 🔜 Next Steps (Phase 4)

1. **Configuration Manager** - UI to view/delete saved group configs
2. **Help Section** - Explain split hours model to users
3. **Custom Modals** - Replace browser `confirm()` with styled modals
4. **Polish** - Animations, mobile improvements, error messages

---

**Last Updated:** Phase 3 Complete - Dark Mode + Multi-Group Features ✅
