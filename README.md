# Bloomly

A personal wellness journal and habit tracker with a responsive dashboard, journal, and progress views.

## Data and privacy

- Journal records are stored in MongoDB and every journal API request requires a valid JWT. Reads, updates, and deletes are scoped to the authenticated account.
- Habits, habit completion dates, and personal goals are stored in browser local storage, partitioned by the signed-in account ID. They are not synchronized to the backend or protected from someone with access to the same browser profile.
- Previously unscoped browser records are left untouched and are not automatically assigned to an account; migrating them requires confirming their owner.
- The application does not send journal data to an AI provider. Reminder times are saved preferences only; the application does not deliver notifications.

## Technologies used

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Recharts, Axios |
| Backend | Node.js, Express, deployed as Vercel serverless functions |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcrypt for password hashing |
| Hosting | Vercel (frontend + backend) |

## Architecture

```
React frontend (Vercel)
        │  REST calls
        ▼
Express API (Vercel serverless functions)
        │                              │
        ▼                              ▼
MongoDB Atlas
(users, journal logs)

  [JWT auth scopes account and journal endpoints]
```

## Key features

- **Signup/login** with password hashing and JWT-based session handling
- **Journal** — mood, energy, optional reflection, and self-care activities
- **Habits and progress** — account-partitioned local habit schedules and completion history
- **Responsive interface** with Dashboard, My Habits, Journal, Progress, and Settings destinations

## Live deployment

- Frontend: https://bloomly-frontend.vercel.app
- Backend API: https://bloomly-delta.vercel.app

## Running locally

**Backend:**
```bash
cd backend
npm install
# create .env with MONGO_URI, JWT_SECRET, PORT
node server.js
```

**Frontend:**
```bash
cd frontend/project
npm install
# create .env with VITE_API_URL=http://localhost:5000/api
npm run dev
```
