# Accenture ATCI Attendance Tracker (GitHub Pages + Firebase)

This app is split-deployed:
- Frontend (static SPA) -> GitHub Pages
- Backend (Auth, Firestore rules/indexes, Cloud Functions) -> Firebase

## Setup

1. Install dependencies:
   - `npm install`
   - `cd functions && npm install`
2. Copy `.env.example` to `.env` in the project root.
3. Set `VITE_BASE_PATH` for your GitHub repo path:
   - Project Pages example: `/Attendance-Tracker/`
   - User/Org Pages root: `/`
4. Ensure Firebase web config values are valid in `.env`.
5. Update main admin UID in `firestore.rules` if required.

## Local Run

- Start frontend: `npm run dev`
- Build frontend: `npm run build`
- Build functions: `cd functions && npm run build`

## Security Model

- Browser app reads data through Firebase SDK with authenticated users.
- Attendance writes are blocked directly in Firestore rules (`attendance` write false).
- All attendance writes go through Cloud Functions (`functions/src/index.ts`).

## Deploy Frontend (GitHub Pages)

1. Configure `.env` with correct `VITE_BASE_PATH`.
2. Run:
   - `npm run deploy:pages`

This publishes `dist` to the `gh-pages` branch.

## Deploy Backend (Firebase)

From project root:
- `npm run deploy:backend`

Or with explicit commands:
- `firebase deploy --only firestore:rules,firestore:indexes`
- `firebase deploy --only functions`

## Firebase Console Checks

Before using the GitHub Pages site, ensure:
- Firebase Authentication authorized domains include `your-username.github.io`
- Firestore rules are deployed
- Functions are deployed and healthy
