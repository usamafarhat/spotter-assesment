# ELD Trip Planner & Log Sheets

Full-stack assessment application for planning truck routes, generating Hours-of-Service (HOS) compliant ELD (Electronic Logging Device) duty logs, and visualizing trips on a map.

**Stack:** Django REST API (`backend/`) + React / TypeScript (`frontend/`)

> **Context for AI agents & reviewers:** This repository is a **take-home technical assessment**. The sections below define the product requirements, domain rules, architecture boundaries, and current implementation status. Use the [Implementation Status](#implementation-status) table before making changes — it marks what is done vs. planned.

---

## Table of Contents

- [What This Project Is](#what-this-project-is)
- [App Requirements](#app-requirements)
- [Domain Rules (HOS & Assumptions)](#domain-rules-hos--assumptions)
- [Inputs & Outputs](#inputs--outputs)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Implementation Status](#implementation-status)
- [Getting Started](#getting-started)
- [Domain Glossary](#domain-glossary)
- [Submission Deliverables](#submission-deliverables)
- [License & Notes](#license--notes)

---

## What This Project Is

This repository is a **take-home assessment submission** for a company evaluation. The app must:

1. Accept trip inputs (locations + current HOS cycle usage).
2. Compute a realistic driving plan under **FMCSA-style HOS rules**.
3. Render route information on an **interactive map** (free map API).
4. Produce **filled daily ELD log sheets** (one per calendar day the trip spans).

**Evaluation focus:** route-planning accuracy and ELD log output correctness. UI/UX quality can offset minor inaccuracies.

---

## App Requirements

### Objective

Build an app that accepts trip details and produces:

| # | Output | Description |
| - | ------ | ----------- |
| 1 | **Route instructions** | Driving plan with stops, mandatory rests, and fueling |
| 2 | **ELD daily log sheets** | FMCSA-style 24-hour grids with duty status segments filled per day |
| 3 | **Interactive map** | Route polyline + markers for stops, rests, pickup, dropoff, and fuel |

### Functional Requirements

| Category | Requirement |
| -------- | ----------- |
| **Goal** | Trip inputs → route plan, interactive map, and multi-day ELD log sheets |
| **Route output** | Driving segments with mandatory rests and fuel stops (≥ every 1,000 miles) |
| **Map output** | Route and stop annotations via a **free** map API |
| **Log output** | One filled ELD log sheet per calendar day the trip spans |
| **Stop times** | 1 hour on duty at pickup; 1 hour on duty at dropoff |
| **Architecture** | HOS/route logic in `backend/`; map and log rendering in `frontend/` |

---

## Domain Rules (HOS & Assumptions)

Use these rules **consistently** across backend logic, API responses, and UI copy.

```yaml
# Machine-readable domain config (for AI agents & tests)
driver_type: property_carrying
hos_cycle: "70 hours / 8 days"
adverse_conditions: false
fuel_stop_interval_miles: 1000
pickup_duration_hrs: 1
dropoff_duration_hrs: 1
duty_statuses:
  - off_duty
  - sleeper
  - driving
  - on_duty
```

| Rule | Value |
| ---- | ----- |
| **Driver type** | Property-carrying driver |
| **HOS cycle** | 70 hours / 8 days |
| **Conditions** | No adverse driving conditions |
| **Fueling** | At least one fuel stop every **1,000 miles** |
| **Loading / unloading** | **1 hour** on duty each for pickup and dropoff |

The backend HOS engine must enforce FMCSA-style limits (driving windows, required rest breaks, cycle caps) and emit a time-ordered sequence of duty segments that the frontend can render as daily log grids.

---

## Inputs & Outputs

### Inputs

| Field | Key (API/TS) | Description |
| ----- | ------------ | ----------- |
| Current location | `currentLocation` | Driver's starting point |
| Pickup location | `pickupLocation` | Where the load is picked up |
| Dropoff location | `dropoffLocation` | Final delivery destination |
| Current cycle used (hrs) | `currentCycleUsedHrs` | Hours already used in the current 70 hr / 8-day cycle (0–70) |

TypeScript interface (frontend): `frontend/src/types/trip.ts` → `TripInput`

### Outputs

| Output | API field / location | Status |
| ------ | -------------------- | ------ |
| **Driving route polyline** | `route_polyline` — `[[lat, lng], ...]` on `Trip` | ✅ On create (OpenRouteService) |
| **Total distance** | `total_distance_miles` | ✅ On create |
| **Total drive duration** | `total_duration_hours` (driving time only; HOS rests not yet applied) | ✅ On create |
| **Map** | Frontend renders polyline + markers | 🔲 Planned |
| **Daily log sheets** | FMCSA 24h grids with duty segments | 🔲 Planned |
| **Route plan (HOS)** | Driving legs, rests, fuel stops with timestamps | 🔲 Planned |

**Current create-trip behavior:** `POST /api/trips/` validates input, calls **OpenRouteService** (backend-only) for a truck route along **current → pickup → delivery**, then saves the trip with polyline, miles, and hours. HOS rests and fuel stops are **not** applied yet — that will extend `trips/services/trip_planner.py`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  frontend/  (React + TypeScript + Vite + Tailwind)          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  TripForm   │  │   MapView    │  │   LogSheetView      │ │
│  │  (inputs)   │  │ (Google Maps │  │ (24h ELD grids)     │ │
│  │             │  │  display)    │  │                     │ │
│  └──────┬──────┘  └──────▲───────┘  └──────────▲──────────┘ │
│         │                │                      │            │
│         └────────────────┼──────────────────────┘            │
│                          │  REST JSON (POST /api/trips/)     │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  backend/  (Django + Django REST Framework)                 │
│  views/          → HTTP in/out (thin)                       │
│  serializers/    → validate request/response shape          │
│  services/       → business logic                           │
│    openrouteservice.py  → ORS directions (API key here)     │
│    trip_planner.py      → plan trip + save Trip             │
│    (future) hos_engine  → rests, fuel, duty segments        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (server-side only)
┌──────────────────────────▼──────────────────────────────────┐
│  OpenRouteService  — driving-hgv route + polyline           │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
| ----- | -------------- |
| **Backend views** | HTTP only: validate → call service → return JSON + status |
| **Backend services** | Routing (ORS), trip planning, future HOS engine |
| **Backend serializers** | Input validation; read/write JSON shape |
| **Frontend** | User input, location picker, API calls, map/log UI |
| **Google Maps (frontend)** | Search, geocode, map display — **not** used for route distance |
| **OpenRouteService (backend)** | Truck route polyline, miles, hours — **API key never sent to browser** |

**Dev proxy:** Vite forwards `/api/*` → `http://127.0.0.1:8000` (see `frontend/vite.config.ts`).

### Routing & location notes (for code readers)

| Topic | Where | Behavior |
| ----- | ----- | -------- |
| **ORS profile** | `trips/services/openrouteservice.py` | `driving-hgv` (truck) |
| **Waypoints on create** | `trips/services/trip_planner.py` | current → pickup → delivery |
| **Snap retry** | `openrouteservice.py` | Attempt 1: 350 m snap; attempt 2: 2 km snap if pins are off-road |
| **Routing errors** | View catches `OpenRouteServiceError` | Returns `{ "detail": "..." }` with user-facing message (rate limit, snap failure, no route, etc.) |
| **Frontend location rule** | `frontend/src/lib/googleMaps.ts` | Search rejects city/state-only picks; map tap allows pin on road |
| **Coordinate precision** | `frontend/src/lib/coordinates.ts` | Lat/lng rounded to 6 decimals before API (matches Django `DecimalField`) |

**Why two map providers?** Google Maps gives a good picker UX; OpenRouteService (free tier) computes the **assessment route** on the backend so the API key stays secret and matches the README “free map API” split (display vs routing).

---

## Repository Structure

```
spotter-assesment/
├── README.md                 ← project overview + requirements (this file)
├── backend/                  ← Django REST API
│   ├── eld_planner/          ← Django project settings
│   ├── trips/
│   │   ├── models.py         ← Trip (locations, polyline, HOS fields TBD)
│   │   ├── views/            ← one URL route → one file (e.g. trips_collection.py)
│   │   ├── serializers/      ← validate I/O; create serializer has no business logic
│   │   └── services/         ← ORS client + trip_planner (+ future HOS)
│   └── README.md             ← API setup, endpoints, routing notes
└── frontend/                 ← React SPA
    ├── src/
    │   ├── api/EldPlanner/   ← HTTP client, React Query hooks
    │   ├── components/
    │   │   ├── layout/       ← App shell, navigation
    │   │   ├── trip/         ← Plan trip form + location picker
    │   │   ├── map/          ← Google Maps picker (display/search)
    │   │   └── home/         ← Dashboard trip cards
    │   ├── lib/              ← getErrorMessage, coordinates, tripDisplay
    │   ├── pages/            ← Dashboard, Trip, Logs tabs
    │   └── types/            ← Shared TypeScript types
```

---

## Implementation Status

> **For AI agents:** Check this table before implementing. Prefer extending existing files over creating duplicates.

| Area | Status | Notes |
| ---- | ------ | ----- |
| Health check API | ✅ Done | `GET /api/health/` |
| Trip list + create API | ✅ Done | `GET/POST /api/trips/` |
| OpenRouteService routing | ✅ Done | On create: polyline, miles, hours via `trips/services/` |
| ORS snap retry | ✅ Done | 350 m → 2 km; user-facing errors name failing stop |
| Trip model | ✅ Done | Locations, `route_polyline`, distance/duration, status |
| Frontend plan trip form | ✅ Done | Wired to `POST /api/trips/` + error handling |
| Frontend trip list (home/trips) | ✅ Done | `useTrips()` + skeleton loaders |
| Frontend API module | ✅ Done | `src/api/EldPlanner/` |
| Trip detail API | 🔲 Planned | `GET /api/trips/<id>/` |
| Duty status log model | 🔲 Planned | `off_duty`, `sleeper`, `driving`, `on_duty` |
| HOS route engine | 🔲 Planned | Rests, fuel stops, cycle tracking in `trip_planner.py` |
| Map polyline display | 🔲 Planned | Render saved `route_polyline` on Google Map |
| ELD log sheet rendering | 🔲 Planned | FMCSA 24h grids in Logs tab |
| Seed demo data | 🔲 Planned | `python manage.py seed_data` |
| Frontend design system | ✅ Done | UI components, Tailwind theme, tab navigation |

**Legend:** ✅ Done · 🟡 In progress · 🔲 Planned

---

## Getting Started

### Prerequisites

- Python 3.11+ (backend)
- Node.js 18+ (frontend)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
cp .env.example .env               # set OPENROUTESERVICE_API_KEY (required for create trip)
python manage.py migrate
python manage.py runserver         # http://127.0.0.1:8000
```

Frontend env (see `frontend/.env.example`):

| Variable | Description |
| -------- | ----------- |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps (picker/display only) |
| `VITE_API_BASE_URL` | Defaults to `/api` (Vite proxy to Django) |

Optional (once implemented):

```bash
python manage.py seed_data         # load sample completed trips
```

See [backend/README.md](backend/README.md) for API docs and development commands.

### Frontend

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

See [frontend/README.md](frontend/README.md) for scripts, component layout, and API layer details.

### Run Both (typical local workflow)

1. Start Django in one terminal (`backend/`).
2. Start Vite in another (`frontend/`).
3. Open [http://localhost:5173](http://localhost:5173).

---

## Domain Glossary

| Term | Meaning |
| ---- | ------- |
| **ELD** | Electronic Logging Device — records a driver's duty status over time |
| **HOS** | Hours of Service — FMCSA rules limiting driving and on-duty time |
| **Duty status** | One of: `off_duty`, `sleeper`, `driving`, `on_duty` |
| **Log sheet** | 24-hour grid showing when each duty status applies |
| **Cycle** | Rolling window (here: 70 hours in 8 days) tracking total on-duty + driving time |
| **Polyline** | Ordered list of `[lat, lng]` points describing the driven path (from ORS) |
| **OpenRouteService (ORS)** | Backend routing API; computes truck route — not called from frontend |

---

## Submission Deliverables

| Deliverable | Description |
| ----------- | ----------- |
| **Live hosted app** | Deploy working version (e.g. Vercel for frontend; backend hosted separately) |
| **Loom walkthrough** | 3–5 minute video covering the app and key codebase areas |
| **GitHub repository** | Complete source code shared with reviewers |
| **$100 reward** | Awarded when hosted version meets accuracy standards |

### Evaluation Criteria

- **Accuracy** — Hosted app tested against expected route planning and ELD log output.
- **UI / UX** — Polished interface can compensate for minor output inaccuracies.

---

## License & Notes

This project was built as a technical assessment. Refer to the company-provided brief for submission deadlines, hosting URLs, and Loom video links once available.
