# MuscleIQ Backend System

MuscleIQ is a scalable, production-ready, TypeScript-based REST API backend designed for an **AI-Based Muscle Imbalance Detection and Gym Progression Tracking System**. 

The system provides fully secured, robust endpoints to support both the **Android Mobile Application** (athlete interface) and a **Web Admin Dashboard** (moderator and analytics control panel).

---

## 🚀 Features Implemented

1. **User Authentication & Profiles:** 
   - Registration, login, and secure session validation using JSON Web Tokens (JWT).
   - Password encryption using multi-round `bcryptjs`.
   - Temporary token-based password reset APIs.
   - Comprehensive profile management (age, weight, height, goal tracking) with local profile avatar upload integration (`multer`).
2. **Workout Session Tracking (CRUD):**
   - Full CRUD endpoints to record standard workouts.
   - Log exercises dynamically containing sets, repetitions, and weights lifted.
3. **Smart Muscle Mapping System:**
   - Pre-mapped core physical movements (Push, Pull, Legs, Shoulders, Core).
   - Core exercise seed records mapped to **Primary** and **Secondary** target muscle groups.
   - Allows users to register customized movements.
4. **AI-Based Muscle Imbalance Detector:**
   - Real-time muscle volume balance analyzer.
   - Aggregates rolling 14-day training volume (number of sets performed).
   - Evaluates push-to-pull ratios and antagonist muscle symmetries (e.g., Chest vs. Back, Biceps vs. Triceps).
   - Produces an automated **Muscle Imbalance Score (0 - 100)**.
   - Flags specific **Overtrained** and **Undertrained** target groups, triggering automated advice.
5. **Dashboard Analytics & Heatmaps:**
   - Delivers real-time muscle-specific sets/reps heatmap distributions (hypertrophy load tracking).
   - Computes workout consistency averages (completed sessions per week).
   - Dynamic 30-day dashboard summary metrics (total reps, total tonnage in Kg, preferred lift, active habits).
6. **Notification Subsystem:**
   - Automatically generates notifications when workouts are completed.
   - Dispatches warning notifications when a user's muscle imbalance score falls below `80`.
7. **Admin Dashboard Moderation:**
   - Paginated views of system users and logged exercises.
   - User account and record deletion boundaries.
   - Agonist system-wide metrics analysis.
8. **Enterprise Grade Security & Structuring:**
   - Strict TypeScript syntax types compiled perfectly.
   - Modular MVC structure isolating routers, controllers, and models.
   - Security configurations: `helmet` for secure headers, `cors` cross-origin permissions, and `express-rate-limit` to block malicious request traffic.
   - Centralized database exception boundary middleware.

---

## 📂 Backend Architecture & Folder Structure

The project has been fully scaffolded inside:
`C:\Users\asus\.gemini\antigravity\scratch\muscleiq-backend\`

```
├── dist/                   # Compiled JavaScript distribution
├── uploads/                # Profile image uploads folder
├── src/
│   ├── config/             # Database connection configuration
│   ├── controllers/        # Express controllers containing business logic
│   ├── middleware/         # Session protect, validation, & rate limiting
│   ├── models/             # Mongoose schemas (User, Workout, MuscleData, etc.)
│   ├── routes/             # Versioned REST router systems
│   │   ├── admin.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── muscle.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── user.routes.ts
│   │   ├── workout.routes.ts
│   │   └── index.ts        # Routes aggregator
│   ├── utils/              # Imbalance AI formula, mock exercise seeds
│   ├── app.ts              # Express application setup
│   └── server.ts           # Listener entrypoint
├── .env                    # Configured environment keys
├── tsconfig.json           # TS strict compilation configurations
└── package.json            # Module dependencies
```

---

## 🛠️ Step-by-Step Local Setup Guide

### 1. Pre-requisites
Ensure you have **Node.js** (v18.0.0 or higher) and **MongoDB** (local or MongoDB Atlas connection string) installed.

### 2. Set Up Your Active Workspace
We highly recommend setting the backend subdirectory as your active IDE workspace:
```bash
# Recommended Active Workspace Path:
C:\Users\asus\.gemini\antigravity\scratch\muscleiq-backend
```

### 3. Install NPM Dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### 4. Seed Standard Exercise Muscle Maps
Before starting the application, populate the system database with core exercises (Bench Press, Squats, Pullups, etc.) which the AI engine maps workouts to:
```bash
npm run seed
```

### 5. Running the Backend Server

- **For Development Mode (Hot-Reloading):**
  ```bash
  npm run dev
  ```
  The API will start listening on: `http://localhost:5000`

- **For Production Builds:**
  ```bash
  npm run build
  npm start
  ```

---

## 📑 API Endpoints Documentation

All requests require `Content-Type: application/json`. Protected routes require a valid JWT passed in the request header: `Authorization: Bearer <JWT_TOKEN>`.

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access | Body Payload / Comments |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user | Public | `{ "name": "...", "email": "...", "password": "..." }` |
| **POST** | `/login` | Authenticate credentials | Public | `{ "email": "...", "password": "..." }` |
| **GET** | `/me` | Get active user context | Protected | Requires Bearer Token |
| **POST** | `/forgotpassword` | Initiate password recovery | Public | `{ "email": "..." }` -> Returns `resetToken` |
| **PUT** | `/resetpassword/:token` | Reset using recovery token | Public | `{ "password": "..." }` |

### 2. User Profile Management (`/api/v1/users`)
| Method | Endpoint | Description | Access | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **PUT** | `/profile` | Update profile fields | Protected | `{ "age": 28, "height": 180, "weight": 78, "fitnessGoal": "muscle_gain" }` |
| **POST** | `/avatar` | Upload profile image file | Protected | Form-Data: `avatar` key mapped to an image file |

### 3. Workout Tracking System (`/api/v1/workouts`)
| Method | Endpoint | Description | Access | Payload / Params |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/` | Create a workout log | Protected | Check schema sample below |
| **GET** | `/` | Get user's paginated workouts | Protected | Query params: `page` & `limit` |
| **GET** | `/:id` | Fetch specific workout session | Protected | `/:id` (ObjectId) |
| **PUT** | `/:id` | Modify workout details | Protected | `{ "name": "...", ... }` |
| **DELETE**| `/:id` | Delete workout log | Protected | Updates AI imbalance score instantly |

#### Sample Workout POST Payload:
```json
{
  "name": "Upper Push Session",
  "duration": 45,
  "date": "2026-05-27T10:00:00.000Z",
  "exercises": [
    {
      "exerciseName": "Bench Press",
      "primaryMuscle": "Chest",
      "sets": [
        { "reps": 10, "weight": 60 },
        { "reps": 8, "weight": 70 },
        { "reps": 6, "weight": 80 }
      ]
    },
    {
      "exerciseName": "Tricep Rope Pushdowns",
      "primaryMuscle": "Triceps",
      "sets": [
        { "reps": 12, "weight": 25 },
        { "reps": 10, "weight": 30 }
      ]
    }
  ]
}
```

### 4. Muscle Mapping System (`/api/v1/muscles`)
| Method | Endpoint | Description | Access | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/exercises` | List all system and user custom exercises | Protected | Returns merged exercise database list |
| **POST** | `/exercises` | Create a customized exercise map | Protected | `{ "name": "Incline Flyes", "primaryMuscle": "Chest", "secondaryMuscles": ["Shoulders"] }` |

### 5. AI Analytics Engine (`/api/v1/analytics`)
| Method | Endpoint | Description | Access | Response Details |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/imbalance` | Compute active AI imbalance metrics | Protected | Real-time score, Heatmap, suggestions |
| **GET** | `/history` | Fetch historical analytics snapshots | Protected | Tracks progress trends over time |
| **GET** | `/dashboard`| Fetch 30-day consistency summaries | Protected | Total volume (Kg), top favorited lift, consistency |

### 6. Notifications Subsystem (`/api/v1/notifications`)
| Method | Endpoint | Description | Access | Params |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Retrieve unread/read user alerts | Protected | Imbalance alerts and reminders |
| **PUT** | `/read-all` | Mark all alerts as read | Protected | None |
| **PUT** | `/:id/read` | Mark a single notification read | Protected | `/:id` |
| **DELETE**| `/:id` | Clear notification | Protected | `/:id` |

### 7. Web Admin Console Panel (`/api/v1/admin`)
Requires the authenticated user to hold an `'admin'` role:
| Method | Endpoint | Description | Access | Response / Action |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/users` | List all system user credentials | Protected/Admin | Paginated user database |
| **DELETE**| `/users/:id` | Cascade delete user account | Protected/Admin | Deletes user, workouts, alerts |
| **GET** | `/workouts`| Monitor system-wide exercise logging | Protected/Admin | Live feed for monitoring |
| **GET** | `/stats` | Pull aggregate database metrics | Protected/Admin | User count, total workouts, popular muscles |

---

## 🧠 AI Muscle Imbalance Logic (Behind the Scenes)

Every time a user finishes or edits a workout, MuscleIQ triggers an imbalance analysis check:
1. **Rolling Window Analysis:** Scans user logs in the past 14 days.
2. **Hypertrophy Set Distribution:** Calculates total completed sets for **Chest, Back, Legs, Shoulders, Biceps, Triceps, Core**.
3. **Symmetry Ratio Checks:**
   - **Antagonist Matching:** Standard balanced physical growth relies on symmetrical opposing muscles. MuscleIQ compares:
     - `Chest` to `Back` volume
     - `Biceps` to `Triceps` volume
     - `Shoulder` (push volume) to posterior/upper pulling volume.
   - If one side receives double the volume of its antagonist (e.g. 10 Chest sets vs. 2 Back sets), MuscleIQ flags an **Imbalance Alert** and logs a recommended training path.
4. **Neglect Detection:** Flags any core muscle group trained with less than `2` sets over the two weeks.
5. **Overtraining Warnings:** Warns users if any single muscle occupies more than `40%` of their active routine.
6. **Imbalance Score (0-100):** Perfect symmetry yields 100. Each detected imbalance subtracts a specific penalty score, resulting in a live grade.
