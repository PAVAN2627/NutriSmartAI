# NutriSmart AI

A full-stack AI-powered nutrition tracking web app built with React, Firebase, and Google Gemini AI. Scan food, get instant macro breakdowns, follow personalized diet plans, track smart goals, find nearby healthy restaurants, and connect with fitness buddies.

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite
- **UI** — Tailwind CSS, shadcn/ui, Radix UI
- **AI** — Google Gemini 2.5 Flash (text + vision)
- **Auth & DB** — Firebase Auth, Firestore
- **Maps** — Google Maps Places API (nearby food), Geolocation API
- **Email** — Google Apps Script (transactional emails)
- **Charts** — Recharts

## Features

| Feature | Description |
|---|---|
| AI Food Scanner | Upload a food photo → Gemini Vision returns calories, macros, health score, and a healthier alternative |
| Personalized Onboarding | 4-step profile setup (body metrics, goal, lifestyle, diet) → Gemini calculates BMR/TDEE and sets daily targets |
| AI Diet Plan | Generates a full 5-meal day plan tailored to your calorie/macro targets, diet type, and goal |
| AI Habit Coach | Analyzes your profile and returns wins, warnings, tips, and a 7-day challenge |
| Budget Food | Enter a daily budget (₹) → AI suggests affordable foods that hit your nutrition targets |
| Smart Goals | Auto-seeded goals from your profile (calories, water, steps, workouts) with +/- progress tracking, saved to Firestore |
| My Reports | Weekly calorie bar chart, protein trend line chart, today's food log, AI insights |
| Fitness Buddy | Finds other users scored by goal/gender/occupation/activity match, lets you send a personalized invite email |
| Nearby Food | Real Google Places API results for healthy restaurants near your GPS location with photos, ratings, open status |
| Settings | Profile management |
| Email Notifications | Welcome email on signup, buddy invite email via Google Apps Script |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/nutrismart-ai.git
cd nutrismart-ai
npm install
```

### 2. Set up environment variables

Create a `.env` file in the root (never commit this):

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Gemini AI
VITE_GEMINI_API_KEY=

# Google Maps (Places API + Geocoding)
VITE_GOOGLE_MAPS_API_KEY=

# Google Apps Script (email service)
VITE_APPS_SCRIPT_URL=
```

### 3. Firebase setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Google provider + Email/Password provider
3. Enable **Firestore Database** → start in production mode
4. Deploy Firestore rules from `firestore.rules`

### 4. Google Gemini API

Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 5. Google Maps API

Enable these APIs in [Google Cloud Console](https://console.cloud.google.com):
- Places API
- Geocoding API

### 6. Email service (Google Apps Script)

1. Go to [script.google.com](https://script.google.com) and create a new project
2. Paste the contents of `nutrismart-apps-script.js`
3. Deploy as a Web App → access: Anyone
4. Copy the deployment URL into `VITE_APPS_SCRIPT_URL`

### 7. Run locally

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── landing/        # Landing page sections
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx
│   └── DashboardLayout.tsx
├── lib/
│   ├── firebase.ts     # Firebase init + persistence
│   ├── gemini.ts       # Gemini AI model helpers
│   ├── emailService.ts # Apps Script email functions
│   └── utils.ts
├── pages/
│   ├── Index.tsx       # Landing page
│   ├── Login.tsx       # Email/password + Google auth
│   ├── Onboarding.tsx  # 4-step profile setup
│   ├── Dashboard.tsx   # Main dashboard with real Firestore data
│   ├── ScanFood.tsx    # Gemini Vision food analysis
│   ├── DietPlan.tsx    # AI-generated meal plan
│   ├── HabitCoach.tsx  # AI habit insights
│   ├── BudgetFood.tsx  # Budget-based AI meal suggestions
│   ├── SmartGoals.tsx  # Goal tracking with Firestore persistence
│   ├── Reports.tsx     # Charts and food log
│   ├── NearbyFood.tsx  # Google Places API restaurants
│   ├── FitnessBuddy.tsx# User matching + invite emails
│   └── Settings.tsx
└── App.tsx
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npm run test      # Run tests (vitest)
```

## License

MIT
