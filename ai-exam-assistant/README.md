# AI Exam Assistant — React.js Frontend

A React implementation of the CSE4204-8B-T05 "AI Exam Assistant" UI/UX design
(landing page, auth, dashboard, question generator, practice + AI chatbot,
study plan, profile, and admin panel). Built with **React + Vite + React
Router**, using the exact color/type/spacing tokens from the original
UI/UX HTML prototype.

This is a **frontend-only** project. All data (sessions, scores, AI feedback,
chat replies) currently comes from a mock service layer in `src/data/`, shaped
so it's a drop-in replacement once the real Node.js/Express + AI backend
(described in the SRS) is ready.

## 1. File structure

```
ai-exam-assistant/
├── package.json            # dependencies + npm scripts
├── vite.config.js          # Vite dev server / build config
├── index.html              # HTML shell, loads fonts + mounts React
├── .gitignore
├── README.md
└── src/
    ├── main.jsx             # React root — wraps App in BrowserRouter + AppProvider
    ├── App.jsx               # All route definitions
    ├── index.css             # Design tokens (colors, type, spacing) + shared UI classes
    │
    ├── context/
    │   └── AppContext.jsx     # Auth state: isAuthenticated, role (student/admin), user
    │
    ├── data/
    │   ├── mockData.js        # Static mock data (stats, sessions, plan, chat, admin)
    │   └── api.js             # Mock "API" functions — swap bodies for real fetch() later
    │
    ├── components/
    │   ├── Sidebar.jsx         # Left nav for student pages (Dashboard/New Session/etc.)
    │   ├── StudentLayout.jsx   # Route guard + sidebar wrapper for student pages
    │   ├── AdminLayout.jsx     # Route guard + sidebar wrapper for the admin panel
    │   └── AccuracyChart.jsx   # SVG line chart used on the Dashboard
    │
    └── pages/
        ├── Landing.jsx         # "/"              — marketing / hero page
        ├── Login.jsx           # "/login"         — FR-02, FR-03
        ├── Register.jsx        # "/register"      — FR-01
        ├── Dashboard.jsx       # "/dashboard"      — FR-18–FR-22
        ├── SessionSetup.jsx    # "/session/new"    — FR-07–FR-12
        ├── Practice.jsx        # "/practice"       — FR-13–FR-17, UC-06 (chatbot)
        ├── StudyPlan.jsx       # "/study-plan"     — FR-23–FR-27
        ├── Profile.jsx         # "/profile"        — FR-04, FR-35
        └── Admin.jsx           # "/admin"          — UC-10, UC-11, UC-12
```

## 2. Where each thing lives (quick answers)

- **Want to change a color, font, or shadow?** → `src/index.css`, the
  `:root { --paper:..., --amber:..., ... }` block at the top. Every page
  reads these CSS variables, so one edit updates the whole app.
- **Want to change what a page shows?** → the matching file in `src/pages/`.
- **Want to change the sidebar links?** → `src/components/Sidebar.jsx`
  (student) or `src/components/AdminLayout.jsx` (admin).
- **Want to change the mock numbers (scores, streak, sessions)?** →
  `src/data/mockData.js`.
- **Want to connect the real backend?** → `src/data/api.js`. Every function
  in that file (e.g. `login`, `generateQuestions`, `submitAnswer`,
  `sendChatMessage`) currently returns mock data after a fake delay. Replace
  each function body with a real `fetch('/api/...')` call to your
  Node.js/Express backend — no page or component needs to change, because
  they only ever import from this file.
- **Want to add a new page/route?** → create the file in `src/pages/`, then
  register it in `src/App.jsx` inside the `<Routes>` block (inside
  `<StudentLayout>` if it needs the sidebar + login check).

## 3. How auth / routing works

- `src/context/AppContext.jsx` holds three pieces of state: `isAuthenticated`,
  `role` (`'student' | 'admin' | null`), and `user`.
- `StudentLayout` and `AdminLayout` both check this state before rendering
  their `<Outlet />` (the actual page). If you're not logged in with the
  right role, you're redirected to `/login`.
- Logging in on `/login` calls `loginAsStudent(user)` (or, for the
  "Log in as administrator" button, `loginAsAdmin()`), which flips
  `isAuthenticated` to `true` and sets the role — this is intentionally
  simple since there's no real backend yet.

## 4. Running the project

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (opens http://localhost:5173)
npm run dev

# 3. Build for production (outputs to dist/)
npm run build

# 4. Preview the production build locally
npm run preview
```

## 5. Suggested next steps (matching the SRS)

1. Build the Node.js/Express + PostgreSQL backend described in the SRS
   (section 6–7), exposing REST endpoints for auth, question generation,
   answer evaluation, dashboard data, study plan, chat, and admin reports.
2. Replace each function body in `src/data/api.js` with a real `fetch()`
   call to those endpoints. Keep the function names and return shapes the
   same so no page code needs to change.
3. Add real JWT-based auth (NFR-08) in place of the current in-memory
   `AppContext` state — e.g. store the token and re-hydrate `isAuthenticated`
   from it on page load.
4. Wire the PDF upload field in `SessionSetup.jsx` to an actual
   `multipart/form-data` request once the Multer + pdf-parse backend
   endpoint exists (FR-08).
