# ELD Planner — Backend

Django REST API for the ELD Trip Planner assessment.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
cp .env.example .env               # DATABASE_URL + keys
python manage.py migrate
python manage.py runserver         # http://127.0.0.1:8000
```

## Environment

Copy `.env.example` → `.env` (gitignored).

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DATABASE_URL` | Yes | PostgreSQL URL (`postgresql://` or `postgresql+psycopg://`) |
| `SECRET_KEY` | Yes (prod) | Django secret key |
| `DEBUG` | No | Default `True` locally; set `False` in production |
| `ALLOWED_HOSTS` | No | Comma-separated hosts, default `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated frontend origins |
| `OPENROUTESERVICE_API_KEY` | Yes (create trip) | OpenRouteService API key — **backend only** |
| `OPENROUTESERVICE_BASE_URL` | No | Default `https://api.openrouteservice.org` |

Create trip **will fail** without a valid ORS key. List/get health still work.

## Project layout

```
backend/
├── eld_planner/           # Django settings (loads .env via python-dotenv)
├── core/                  # Health check
├── trips/
│   ├── models.py          # Trip model
│   ├── views/             # HTTP layer (thin)
│   │   └── trips_collection.py   # GET + POST /api/trips/
│   ├── serializers/       # Request/response validation only
│   └── services/          # Business logic (no HTTP)
│       ├── openrouteservice.py   # ORS HTTP client
│       └── trip_planner.py       # create_planned_trip()
├── manage.py
└── requirements.txt
```

### Layer responsibilities

| Layer | Does | Does not |
| ----- | ---- | -------- |
| **View** | Parse HTTP, call serializer + service, return status/JSON | Call ORS directly |
| **Serializer** | Validate input shape | Fetch routes or save with ORS |
| **Service** | ORS routing, trip planning, future HOS | Know about `Request` / `Response` |

## API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/health/` | Service health check |
| GET | `/api/trips/` | List all trips (newest first) |
| POST | `/api/trips/` | Create trip + fetch driving route |

### POST `/api/trips/` — create trip

**Flow:**

```
Client → TripsCollectionView.post()
       → TripCreateSerializer (validate)
       → create_planned_trip() in trip_planner.py
            → get_driving_route() in openrouteservice.py
                 → ORS POST /v2/directions/driving-hgv/geojson
            → Trip.objects.create(..., route_polyline, miles, hours)
       → TripSerializer (response)
```

**Request body:**

```json
{
  "current_location": { "address": "...", "latitude": "31.520272", "longitude": "74.405794" },
  "pickup_location": { "address": "...", "latitude": "31.520272", "longitude": "74.405794" },
  "delivery_location": { "address": "...", "latitude": "30.173589", "longitude": "71.508964" },
  "current_cycle_used_hrs": "12.5",
  "notes": ""
}
```

**Success (`201`):** Full trip object including plan results:

| Field | Description |
| ----- | ----------- |
| `route_polyline` | `[[lat, lng], ...]` — full path for map rendering |
| `total_distance_miles` | Driving distance (ORS summary) |
| `total_duration_hours` | Driving time only (HOS rests not applied yet) |
| `status` | `"planned"` |

**Routing waypoints:** current → pickup → delivery (3-leg path).

### OpenRouteService integration

Implemented in `trips/services/openrouteservice.py`.

| Setting | Value |
| ------- | ----- |
| Profile | `driving-hgv` (truck) |
| Snap attempt 1 | 350 m radius per waypoint |
| Snap attempt 2 | 2000 m radius if attempt 1 fails (off-road pins) |

**Not exposed as a public API** — only called from `trip_planner` during create.

### Error responses (routing failures)

View returns `{ "detail": "<user-facing message>" }`. Frontend reads this via `getErrorMessage()`.

| Situation | HTTP | Example `detail` |
| --------- | ---- | ---------------- |
| Pin off road network (after 2 km snap) | `422` | Names failing stop(s): current / pickup / delivery — suggests dragging pin to a main road |
| No continuous route | `422` | Stops too far apart or missing map data |
| ORS rate limit | `429` | Provider quota — not an app error |
| ORS timeout / outage | `502` / `504` | Provider unavailable — not an app error |
| Missing API key | `503` | Planning temporarily unavailable |

Internal debug text is in `OpenRouteServiceError` logs/message; only `user_message` goes to the client.

## Development

```bash
source .venv/bin/activate
pip install -r requirements-dev.txt   # ruff
ruff format .
ruff check --fix .
python manage.py check
python manage.py runserver
```

Run migrations after model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

## Planned extensions (add docs here when implemented)

| Feature | Target file | Notes |
| ------- | ----------- | ----- |
| HOS engine | `trips/services/trip_planner.py` or `hos_engine.py` | Rests, fuel every 1000 mi, duty segments |
| Duty segments model | `trips/models.py` | `off_duty`, `sleeper`, `driving`, `on_duty` |
| Trip detail | `trips/views/trip_detail.py` | `GET /api/trips/<id>/` |
| Trip logs API | `trips/views/trip_logs.py` | ELD log data for frontend grids |
