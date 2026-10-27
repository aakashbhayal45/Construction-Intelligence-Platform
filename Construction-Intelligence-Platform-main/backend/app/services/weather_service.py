"""
Weather service using Open-Meteo API (free, no API key required).
Geocodes the location name to lat/lon using the Open-Meteo geocoding API.
"""
import logging
import httpx
from app.schemas.schemas import WeatherInfo

logger = logging.getLogger(__name__)

GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

# WMO Weather code to description mapping
WMO_CODES = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
    55: "Dense Drizzle", 61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    77: "Snow Grains", 80: "Slight Rain Showers", 81: "Moderate Rain Showers",
    82: "Violent Rain Showers", 85: "Slight Snow Showers", 86: "Heavy Snow Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Slight Hail", 99: "Thunderstorm with Heavy Hail",
}


async def get_weather(location: str) -> WeatherInfo:
    """Fetch current weather for a location string."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        # Step 1: Geocode location
        geo_response = await client.get(
            GEOCODING_URL,
            params={"name": location, "count": 1, "language": "en", "format": "json"},
        )
        geo_data = geo_response.json()
        results = geo_data.get("results", [])

        if not results:
            logger.warning(f"Could not geocode location: {location}, using defaults")
            # Default to New Delhi, India
            lat, lon = 28.6139, 77.2090
        else:
            lat = results[0]["latitude"]
            lon = results[0]["longitude"]

        # Step 2: Fetch weather
        weather_response = await client.get(
            WEATHER_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current": [
                    "temperature_2m",
                    "wind_speed_10m",
                    "precipitation",
                    "relative_humidity_2m",
                    "weather_code",
                ],
                "timezone": "Asia/Kolkata",
            },
        )
        weather_data = weather_response.json()
        current = weather_data.get("current", {})

        weather_code = current.get("weather_code", 0)
        condition = WMO_CODES.get(weather_code, "Unknown")

        return WeatherInfo(
            temperature_c=round(current.get("temperature_2m", 25.0), 1),
            wind_speed_kmh=round(current.get("wind_speed_10m", 10.0), 1),
            precipitation_mm=round(current.get("precipitation", 0.0), 1),
            humidity_percent=round(current.get("relative_humidity_2m", 60.0), 1),
            condition=condition,
        )
