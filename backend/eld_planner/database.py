from urllib.parse import parse_qs, unquote, urlparse


def database_config_from_url(url: str) -> dict:
    """Parse DATABASE_URL into Django DATABASES['default'] settings."""
    normalized = url.strip()
    if normalized.startswith("postgresql+psycopg://"):
        normalized = "postgresql://" + normalized.removeprefix("postgresql+psycopg://")
    elif normalized.startswith("postgres://"):
        normalized = "postgresql://" + normalized.removeprefix("postgres://")

    parsed = urlparse(normalized)
    if parsed.scheme not in {"postgresql", "postgres"}:
        raise ValueError(f"Unsupported database scheme: {parsed.scheme}")

    config: dict = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname or "localhost",
        "PORT": str(parsed.port or 5432),
    }

    query = parse_qs(parsed.query)
    if "sslmode" in query:
        config["OPTIONS"] = {"sslmode": query["sslmode"][0]}

    return config
