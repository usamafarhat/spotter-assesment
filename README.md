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

| Output | Description |
| ------ | ----------- |
| **Map** | Route polyline plus markers/info for stops, rests, pickup, dropoff, and fuel stops |
| **Daily log sheets** | FMCSA-style 24-hour grids with duty status segments (`off_duty`, `sleeper`, `driving`, `on_duty`) for each day of the trip |
| **Route plan** | Ordered list of driving legs, rests, and stops with timestamps |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  frontend/  (React + TypeScript + Vite + Tailwind)          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  TripForm   │  │   MapView    │  │   LogSheetView      │ │
│  │  (inputs)   │  │ (free map    │  │ (24h ELD grids)     │ │
│  │             │  │  API)        │  │                     │ │
│  └──────┬──────┘  └──────▲───────┘  └──────────▲──────────┘ │
│         │                │                      │            │
│         └────────────────┼──────────────────────┘            │
│                          │  REST JSON                        │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  backend/  (Django + Django REST Framework)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  HOS / route engine  →  trip plan + duty log segments  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Responsibility |
| ----- | -------------- |
| **Backend** | Geocoding/routing coordination, HOS compliance, trip + log segment generation, persistence |
| **Frontend** | User input, API calls, map rendering, ELD log sheet UI |

**Dev proxy:** Vite forwards `/api/*` → `http://127.0.0.1:8000` (see `frontend/vite.config.ts`).

---

## Repository Structure

```
spotter-assesment/
├── README.md                 ← project overview + requirements (this file)
├── backend/                  ← Django REST API
│   ├── eld_planner/          ← Django project settings
│   ├── trips/                ← main app (models, views, HOS engine)
│   └── README.md             ← API setup, endpoints, tests
└── frontend/                 ← React SPA
    ├── src/
    │   ├── api/              ← HTTP client & endpoint helpers
    │   ├── components/
    │   │   ├── layout/       ← App shell, navigation
    │   │   ├── trip/         ← Trip input form
    │   │   ├── map/          ← Route map
    │   │   └── logs/         ← ELD log sheet rendering
    │   ├── hooks/            ← React hooks (e.g. useHealth)
    │   ├── pages/            ← Dashboard, Trip, Logs tabs
    │   └── types/            ← Shared TypeScript types
    └── README.md             ← dev server, scripts, component notes
```

---

## Implementation Status

> **For AI agents:** Check this table before implementing. Prefer extending existing files over creating duplicates.

| Area | Status | Notes |
| ---- | ------ | ----- |
| Health check API | ✅ Done | `GET /api/health/` |
| Trip CRUD API | 🔲 Planned | `/api/trips/`, `/api/trip-logs/` |
| Duty status log model | 🔲 Planned | `off_duty`, `sleeper`, `driving`, `on_duty` |
| Seed demo data | 🔲 Planned | `python manage.py seed_data` |
| HOS route engine | 🔲 Planned | Rests, fuel stops, cycle tracking |
| Trip planning UI | 🟡 In progress | Design system + input form styles; API not wired |
| Map integration | 🔲 Planned | Free map API in `MapView` |
| ELD log sheet rendering | 🔲 Planned | FMCSA 24h grids in `LogSheetView` |
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
python manage.py migrate
python manage.py runserver         # http://127.0.0.1:8000
```

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
| **FMCSA** | Federal Motor Carrier Safety Administration (U.S. trucking regulator) |

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
