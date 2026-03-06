# Seva App (Temple Seva Management System)

Seva App is a mobile-first temple seva scheduling platform with a React frontend and Google Apps Script backend backed by Google Sheets.

## Tech Stack

- Frontend: React + Vite + TailwindCSS + React Router
- Calendar UI: FullCalendar (month, week, day)
- HTTP: Axios
- Date Logic: Day.js
- Backend API: Google Apps Script Web App
- Database: Google Sheets
- Deployment: GitHub Pages (frontend) + Apps Script deployment (backend)

## Project Structure

```text
src
 ├── components
 │    Navbar.jsx
 │    SevaForm.jsx
 │    SevekariForm.jsx
 │    AssignmentForm.jsx
 │    CalendarView.jsx
 ├── pages
 │    Dashboard.jsx
 │    SevaPage.jsx
 │    SevekariPage.jsx
 │    SchedulePage.jsx
 ├── services
 │    api.js
 ├── utils
 │    recurrenceHelper.js
 ├── App.jsx
 └── main.jsx
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Update `.env` with your Apps Script URL and secret key.

3. Run local server:

```bash
npm run dev
```

## Google Sheets Schema Setup

Create spreadsheet **Seva_App_DB** with sheets and headers exactly as below.

### Seva_Master

```text
seva_id,seva_name,description,start_time,end_time,recurrence_type,recurrence_days,is_active,created_at
```

### Sevekari_Master

```text
sevekari_id,name,phone,email,availability_days,notes,is_active,created_at
```

### Seva_Assignment

```text
assignment_id,seva_id,sevekari_id,start_date,end_date,recurrence_type,recurrence_days,created_at
```

## Google Apps Script Backend

1. Open Apps Script attached to your spreadsheet.
2. Paste `backend/apps-script/Code.gs`.
3. Replace `SECRET_KEY` value.
4. Deploy as Web App:
   - Execute as: **Me**
   - Access: **Anyone with the link** (or restricted according to your org)
5. Use deployment URL as `VITE_API_URL`.


## Public Seva Viewer (/seva)

A public read-only schedule page is available at `/seva` for devotees/volunteers and Android WebView embedding.

Features:
- Daily, Weekly, and Monthly views
- Date navigation (Prev/Next)
- Monthly FullCalendar with event detail modal
- Short-term local cache + auto-refresh every 60 seconds
- No admin navigation and no edit controls

## API Actions

### GET

- `?action=getSevas`
- `?action=getSevekari`
- `?action=getAssignments`
- `?action=getSchedule`

### POST (requires `secretKey`)

- `?action=createSeva`
- `?action=createSevekari`
- `?action=assignSeva`

Conflict detection is enforced in `assignSeva` before insert; conflicting assignments return:

```json
{ "success": false, "message": "Time conflict detected" }
```

## Deployment

### Frontend (GitHub Pages)

```bash
npm run build
npm install gh-pages --save-dev
npm run deploy
```

Set `homepage` in `package.json` to your GitHub Pages URL.

### Backend

Redeploy Apps Script Web App whenever backend changes.

## Notes

- Uses reusable forms and a mobile-first bottom navigation.
- Calendar event click shows an inline detail panel.
- Dashboard surfaces today's and next 7 days schedule.
