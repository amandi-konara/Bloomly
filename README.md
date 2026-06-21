# Bloomly 🌸

A wellness and study-habit companion for women university students.

## Problem statement

University life is demanding, and for many women students, wellbeing tracking tools feel clinical, generic, or disconnected from the realities of student life — irregular sleep, exam stress, and fluctuating energy levels rarely get acknowledged in a way that feels supportive rather than like another chore to log. Most existing habit trackers are built around streaks and numbers, with no warmth and no understanding of the student experience.

Bloomly addresses this gap by giving students a gentle, encouraging space to log their mood, energy, study hours, and small wins each day — and an AI companion that turns those logs into personalized, supportive guidance rather than generic advice.

## Solution overview

Bloomly is a full-stack wellness tracker where students log a daily entry — their "vibe" (mood), energy level, study hours, self-care moments, and one small "bloom" (a tiny win or happy moment). The dashboard visualizes streaks, energy/study trends over time, and surfaces an AI-generated set of supportive tips based on the student's recent patterns, framed in warm, growth-oriented language rather than clinical advice.

## Technologies used

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Recharts, Axios |
| Backend | Node.js, Express, deployed as Vercel serverless functions |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcrypt for password hashing |
| AI integration | Anthropic API (Claude) for personalized wellness tips |
| Hosting | Vercel (frontend + backend) |

**Evidence:**
- `frontend/project/package.json` — react, react-router-dom, recharts, axios, tailwindcss
- `backend/package.json` — express, mongoose, jsonwebtoken, bcryptjs, cors
- `backend/routes/ai.js` — direct integration with the Anthropic Messages API

## Architecture

```
React frontend (Vercel)
        │  REST calls
        ▼
Express API (Vercel serverless functions)
        │                              │
        ▼                              ▼
MongoDB Atlas                  Anthropic API
(users, daily logs)         (generates wellness tips)

  [JWT auth secures all log and tip routes]
```

## Key features

- **Secure signup/login** with hashed passwords and JWT-based session handling
- **Daily log** — mood ("vibe"), energy level, study hours, self-care checklist, and a "little bloom" gratitude note
- **Dashboard** — current streak, today's vibe, energy/study trend chart, and a "memory lane" of past little wins
- **AI-powered tips** — calls the Anthropic API with the student's last 7 days of logs to generate short, warm, supportive guidance
- **Responsive, mobile-friendly UI** with a soft, encouraging visual design

## Live deployment

- Frontend: https://bloomly-frontend.vercel.app
- Backend API: https://bloomly-delta.vercel.app

## Running locally

**Backend:**
```bash
cd backend
npm install
# create .env with MONGO_URI, JWT_SECRET, ANTHROPIC_API_KEY, PORT
node server.js
```

**Frontend:**
```bash
cd frontend/project
npm install
# create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```
