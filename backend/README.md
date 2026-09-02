# ELD Planner — Backend

Django REST API for the ELD Trip Planner assessment.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver         # http://127.0.0.1:8000
```

## Project layout

```
backend/
├── .venv/                 # local virtual environment
├── eld_planner/           # Django project settings
├── trips/                 # main Django app
├── manage.py
└── requirements.txt
```

## API

| Method | Endpoint        | Description        |
| ------ | --------------- | ------------------ |
| GET    | `/api/health/`  | Service health check |

## Development

Activate the virtual environment before running any Django commands:

```bash
source .venv/bin/activate
```

Run migrations after model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```
