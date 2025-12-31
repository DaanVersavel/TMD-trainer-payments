# Trainer Payment Calculator

A production-ready web application for calculating trainer payments based on attendance records from Excel files. Features a budget-sharing payment model where session hours are split equally among attending trainers.

## 🌟 Features

### Core Functionality
- ✅ **Excel File Processing** - Upload and parse attendance records
- ✅ **Flexible Configuration** - Set custom prices and durations per time slot
- ✅ **Budget-Sharing Model** - Hours split equally among present trainers
- ✅ **Multi-Group Support** - Process multiple groups with combined totals
- ✅ **Auto-Save Configurations** - Reuse settings for recurring groups
- ✅ **Edit & Delete Groups** - Modify processed groups on the fly

### User Experience
- ✅ **Dark Mode UI** - Professional, modern interface
- ✅ **Drag & Drop Upload** - Easy file handling
- ✅ **Custom Modals** - No browser dialogs, smooth animations
- ✅ **Configuration Manager** - View and manage saved settings
- ✅ **Help System** - Comprehensive in-app instructions
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Validation Warnings** - Clear feedback for skipped rows

### Technical Features
- ✅ **43 Unit Tests** - Comprehensive test coverage
- ✅ **TypeScript** - Full type safety
- ✅ **React 19** - Latest React features
- ✅ **Local Storage** - Client-side data persistence
- ✅ **Smooth Animations** - Professional transitions throughout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd TMD-trainer-payments

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📊 How It Works

### Payment Calculation Model

The application uses a **budget-sharing model**:

```
hours_per_trainer = session_duration ÷ trainers_present
```

**Examples:**
- 2-hour session, 2 trainers → Each gets 1 hour
- 3-hour session, 3 trainers → Each gets 1 hour
- 2-hour session, 1 trainer → That trainer gets 2 hours

This ensures a fixed budget per session regardless of trainer attendance.

### Workflow

1. **Upload** - Enter group name, price, and upload Excel file
2. **Configure** - Set durations for each detected time slot
3. **Calculate** - Review results and detailed breakdown
4. **Combine** - Process additional groups and view totals

## 📄 Excel File Format

Your Excel file should contain:

| Column | Description | Format |
|--------|-------------|--------|
| Event | Training date | Any date format |
| Tijd | Time slot | HH:MM (e.g., "18:30") |
| Trainer columns | One column per trainer | "Trainer (1)" = present, empty = absent |
| Totals | Number of trainers present | Whole number (1, 2, 3...) |

**Example:**
```
| Event      | Tijd  | John | Jane | Mike | Totals |
|------------|-------|------|------|------|--------|
| 2024-01-15 | 18:30 | Trainer (1) |      | Trainer (1) | 2 |
| 2024-01-16 | 19:00 | Trainer (1) | Trainer (1) | Trainer (1) | 3 |
```

Rows with missing Event or Tijd will be skipped and reported in warnings.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- ✅ Payment calculation logic (15 tests)
- ✅ Data validation (15 tests)
- ✅ Excel parsing (5 tests)
- ✅ Edge cases and error handling
- ✅ Split hours model verification

## 🛠️ Technology Stack

- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3
- **File Processing:** xlsx library
- **Testing:** Vitest + React Testing Library
- **Storage:** Browser localStorage
- **Linting:** ESLint 9

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## 🎨 Project Structure

```
src/
├── components/          # React components
│   ├── FileUpload.tsx
│   ├── GroupConfiguration.tsx
│   ├── TimeSlotConfiguration.tsx
│   ├── GroupResults.tsx
│   ├── CombinedResults.tsx
│   ├── DetailedBreakdown.tsx
│   ├── EditGroupModal.tsx
│   ├── ConfirmationModal.tsx
│   ├── ConfigurationManager.tsx
│   ├── HelpSection.tsx
│   ├── ValidationWarnings.tsx
│   ├── ProcessingStatus.tsx
│   └── index.ts
├── services/           # Business logic
│   ├── excelParser.ts
│   ├── paymentCalculator.ts
│   ├── validator.ts
│   ├── storageService.ts
│   └── index.ts
├── hooks/             # Custom React hooks
│   └── useAppState.ts
├── types/             # TypeScript definitions
│   └── index.ts
├── App.tsx            # Main application
└── index.css          # Global styles

__tests__/             # Test files
├── paymentCalculator.test.ts
├── validator.test.ts
└── excelParser.test.ts
```

## 🔧 Configuration

The app automatically saves configurations to localStorage. Each configuration includes:
- Group name
- Price per hour
- Time slot durations
- Last used timestamp

Access the Configuration Manager (⚙️ icon) to view and delete saved configurations.

## 💡 Tips

1. **Reuse Configurations** - Process the same group repeatedly without re-entering settings
2. **Check Warnings** - Review skipped rows in the validation warnings section
3. **Detailed Breakdown** - Use "Show Detailed Breakdown" to verify hours per time slot
4. **Edit Groups** - Correct mistakes without reprocessing from scratch
5. **Help Section** - Click ❓ icon anytime for in-app help

## 🐛 Troubleshooting

### Excel file not parsing
- Ensure columns are named "Event", "Tijd", and "Totals"
- Check that time format is HH:MM
- Verify "Trainer (1)" for present trainers

### Configuration not auto-filling
- Ensure group name matches exactly (case-insensitive)
- Check Configuration Manager to verify saved configs

### Calculations seem wrong
- Review Detailed Breakdown for hour distribution
- Remember: hours are split among present trainers
- Check that all time slots have durations configured

## 📝 Development

### Code Style
- TypeScript with strict mode
- ESLint for code quality
- Functional React components with hooks
- Comprehensive JSDoc comments

### Adding Features
1. Create new components in `src/components/`
2. Add business logic to `src/services/`
3. Update types in `src/types/`
4. Write tests in `__tests__/`
5. Export from barrel files (index.ts)

## 📄 License

[Add your license here]

## 👥 Authors

[Add your name/organization here]

## 🙏 Acknowledgments

Built with React, TypeScript, and Tailwind CSS.

---

**Version:** 1.0.0 (Phase 4 Complete)
**Status:** Production Ready ✅
