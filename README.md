# Food Log Diary

A comprehensive food logging application that tracks nutrition intake and correlates it with blood sugar readings from Libre 3.

## Features

- 🍽️ **Food Entry**: Search and add foods using the USDA FoodData Central API
- 📊 **Nutrition Tracking**: Automatic calculation of daily nutrition totals (calories, protein, carbs, fat, fiber, sugar, sodium)
- 🩺 **Blood Sugar Integration**: Manual entry and CSV import for Libre 3 readings
- 📈 **Correlation Analysis**: Visualize relationships between nutrition and blood sugar levels
- 📅 **Daily Dashboard**: View all entries and totals for any date

## Setup

### Prerequisites

- Node.js 18+ and npm
- USDA FoodData Central API key (free at https://fdc.nal.usda.gov/api-guide.html)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your USDA API key:
```
USDA_API_KEY=your_api_key_here
```

3. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend app on http://localhost:3000

### Accessing from iPhone or Other Devices

To access the app from your iPhone or other devices on the same network:

1. **Find your PC's IP address:**
   - Open Command Prompt or PowerShell
   - Run: `ipconfig`
   - Look for "IPv4 Address" (e.g., `192.168.1.100`)

2. **Make sure your PC and iPhone are on the same Wi-Fi network**

3. **Access the app from your iPhone:**
   - Open Safari or any browser on your iPhone
   - Go to: `http://<your-pc-ip>:3000`
   - Example: `http://192.168.1.100:3000`

4. **Note:** You may need to allow the connection through Windows Firewall when first accessing from another device.

**Important:** The app must be running on your PC for your iPhone to access it. Keep `npm run dev` running.

## Usage

### Adding Food Entries

1. Go to the "Add Food" tab
2. Search for foods using the USDA database
3. Select a food and enter the amount consumed
4. Choose meal type (optional)
5. Add the entry

### Adding Blood Sugar Readings

1. Go to the "Blood Sugar" tab
2. Enter a single reading manually, or
3. Import multiple readings via CSV format:
   ```
   timestamp,reading,notes
   2024-01-15T08:00:00,120,Before breakfast
   2024-01-15T12:00:00,145,After lunch
   ```

### Viewing Analysis

1. Go to the "Analysis" tab
2. Select a date range
3. View correlation coefficients and charts showing relationships between nutrition and blood sugar

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (local) or PostgreSQL (cloud)
- **Charts**: Recharts
- **Nutrition API**: USDA FoodData Central

## Database

The app automatically uses:
- **SQLite** for local development (database file at `server/data/food_log.db`)
- **PostgreSQL** for cloud deployment (when `DATABASE_URL` environment variable is set)

No configuration needed - it detects which database to use automatically!

## Cloud Deployment

This app is ready for cloud deployment! See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for cloud service comparison and [DEPLOYMENT_STEPS.md](DEPLOYMENT_STEPS.md) for step-by-step instructions.

**Recommended**: Deploy to Render.com (free tier available) for access from anywhere, including your iPhone.

## Future Enhancements

- Direct LibreView API integration
- Meal planning features
- Export reports (PDF/CSV)
- Mobile app version
- User authentication and cloud sync

## License

MIT

