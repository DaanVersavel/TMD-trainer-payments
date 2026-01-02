# Trainer Payment Calculator

Calculate trainer payments based on attendance records from Excel files. Uses a budget-sharing model where session hours are split equally among attending trainers.

---

## 🐳 Quick Start with Docker

### Pull and run the latest version:
```bash
docker pull ghcr.io/daanversavel/tmd-trainer-payments:latest
docker run -d -p 8080:80 ghcr.io/daanversavel/tmd-trainer-payments:latest
```

Then open: **http://localhost:8080**

### Or use docker-compose:
```yaml
services:
  trainer-payments:
    image: ghcr.io/daanversavel/tmd-trainer-payments:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with: `docker-compose up -d`

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open: **http://localhost:5173**

### Build for production
```bash
npm run build
npm run preview
```

---

## 📊 What It Does

### Payment Model
Hours are **split equally** among trainers present at each session:

```
hours_per_trainer = session_duration ÷ trainers_present
```

**Examples:**
- 2-hour session, 2 trainers → Each gets 1 hour
- 3-hour session, 3 trainers → Each gets 1 hour  
- 2-hour session, 1 trainer → Gets 2 hours

### Features
- ✅ Upload Excel attendance records
- ✅ Configure price per hour and session durations
- ✅ Process multiple groups with combined totals
- ✅ Save configurations for reuse
- ✅ Edit and delete processed groups
- ✅ Detailed breakdown per time slot
- ✅ Dark mode UI with smooth animations

---

## 📄 Excel File Format

Required columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Datum activiteit** | Training date | 04/11/2025 |
| **Event time** | Time slot | 18:30 |
| **Event name** | Session name | U10 - Training |
| **Totals** | Number of trainers present | 2 |
| **Trainer columns** | One column per trainer | "Trainer (1)" or empty |

**Attendance marking:**
- `Trainer (1)` = Present
- Empty cell = Absent

**Example:**
```
| Datum activiteit | Event time | Event name      | Totals | John         | Jane | Mike         |
|------------------|------------|-----------------|--------|--------------|------|--------------|
| 04/11/2025       | 18:30      | U10 - Training  | 2      | Trainer (1)  |      | Trainer (1)  |
| 08/11/2025       | 10:00      | U10 - Training  | 2      | Trainer (1)  | Trainer (1) |   |
```

---

## 🔧 Technology Stack

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Build:** Vite 6
- **Excel Parsing:** xlsx
- **Storage:** Browser localStorage
- **Container:** Docker + Nginx

---

## 📝 License

MIT
