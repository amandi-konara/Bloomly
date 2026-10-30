### Bloomly - Personal Wellness and Habit Tracker

Bloomly is a personal wellness and habit-tracking web application. It helps users build healthy routines, record daily moods, write journal entries and review their progress in one place.

The application brings together habit management, daily check-ins, a wellness journal and progress summaries through a clean interface with soft colours and simple navigation.

### Features

Dashboard
- View a personalised welcome message.
- See today's habit overview.
- Open the daily mood and energy check-in.
- View the daily habit checklist.

My Habits
- Create habits and give each habit a name.
- Organise habits into categories such as Mindfulness, Hydration, Movement, Rest, Nutrition, Focus and Other.
- Choose a habit frequency.
- Save an optional preferred reminder time.
- View and manage active and archived habits.

Journal
- Browse journal information by date using the calendar.
- Record a mood and energy level.
- Add personal notes and select wellness activities.
- Review journal entries in the entries list.
- Edit or delete entries where these actions are available.
- View weekly insights, including mood check-ins, average energy and mood distribution.

Progress
- View habit completion for the current and previous six days.
- Review individual habit history.
- Review mood and energy check-ins.
- View personal goals.

Settings
- View and update profile details.
- Save a preferred check-in time.
- Switch between light and dark appearance using the theme control.
- Log out of the application.

Note: The settings and habit form indicate that a preferred reminder time can be saved, but Bloomly does not currently send reminder or notification messages.

### Technologies

Update this list to match the technologies and libraries used in the final source code.

- Frontend: React
- Language: JavaScript
- Backend: Node.js and Express
- Database: MongoDB
- Development tools: Visual Studio Code, Git and GitHub


### Getting Started

1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Bloomly
```

2. Install dependencies

Install the frontend dependencies in the frontend folder:

```bash
cd frontend
npm install
```

Install the backend dependencies in a separate terminal:

```bash
cd backend
npm install
```

3. Configure environment variables

Create a `.env` file in the backend folder using the variable names expected by your application.

Example only:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Add any other variables required by your project. Do not commit `.env` files, database passwords or secret keys to GitHub.

4. Start the application

Run the backend using the start script defined in its `package.json`. For example:

```bash
npm start
```

Run the frontend in a separate terminal using its configured development script. For example:

```bash
npm run dev
```

Use the actual scripts listed in each `package.json`.

### Project Links

- Live application: https://bloomly-delta.vercel.app

---

*Bloomly – Small steps towards a healthier everyday routine.*
