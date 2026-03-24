from functools import lru_cache
from pathlib import Path
from typing import List, Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .azure_client import azure_client
except ImportError:
    from azure_client import azure_client

# Load environment variables
load_dotenv()

app = FastAPI(title="Explore Texas API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SYSTEM PROMPT (Provided for Students) ---
EXPLORE_TEXAS_SYSTEM_PROMPT = """
You are the 'Explore Texas' AI assistant, a friendly and knowledgeable travel guide for the state of Texas.
Your goal is to help users find the best restaurants, attractions, hotels, and flights in Texas using the provided data.

Rules:
1. Always be polite and enthusiastic about Texas.
2. Use the provided search results to answer questions. If the data isn't there, say you don't have that specific information but suggest something similar from the data.
3. For restaurant questions, mention the 'Signature Dish' and 'Rating' if available.
4. For hotels, mention 'Amenities' and 'Rate'.
5. If someone asks for a trip plan, combine results from multiple categories (e.g., a flight, a hotel, and a restaurant).
6. Mention Texas cities specifically (Austin, Houston, Dallas, etc.).
"""

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
CATEGORY_CONFIG = {
    "restaurants": {
        "file": "texas_restaurants.csv",
        "location_field": "City",
        "summary_fields": ["Category", "Price", "Rating"],
    },
    "attractions": {
        "file": "texas_attractions.csv",
        "location_field": "City",
        "summary_fields": ["Category", "Admission", "Rating"],
    },
    "hotels": {
        "file": "texas_hotels.csv",
        "location_field": "City",
        "summary_fields": ["Category", "Rate", "Amenities"],
    },
    "flights": {
        "file": "texas_flights.csv",
        "location_field": "Destination",
        "summary_fields": ["Origin", "Airline", "Price", "Duration"],
    },
}
TRIP_KEYWORDS = {"trip", "plan", "weekend", "vacation", "itinerary", "travel"}
CATEGORY_KEYWORDS = {
    "restaurants": {
        "restaurant",
        "restaurants",
        "food",
        "bbq",
        "tex-mex",
        "dinner",
        "lunch",
    },
    "attractions": {
        "attraction",
        "attractions",
        "museum",
        "park",
        "landmark",
        "things to do",
    },
    "hotels": {"hotel", "hotels", "stay", "lodging", "resort", "suite"},
    "flights": {"flight", "flights", "airport", "fly", "plane", "airline"},
}


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []


@lru_cache(maxsize=None)
def load_category_records(category: str) -> list[dict]:
    config = CATEGORY_CONFIG.get(category)
    if not config:
        raise KeyError(category)

    file_path = DATA_DIR / config["file"]
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset not found: {file_path}")

    frame = pd.read_csv(file_path).fillna("")
    return frame.to_dict(orient="records")


@lru_cache(maxsize=1)
def known_locations() -> list[str]:
    locations = set()
    for category, config in CATEGORY_CONFIG.items():
        field = config["location_field"]
        for record in load_category_records(category):
            value = str(record.get(field, "")).strip()
            if value:
                locations.add(value)
    return sorted(locations, key=len, reverse=True)


def score_record(record: dict, query: str) -> int:
    haystack = " ".join(str(value) for value in record.values()).lower()
    query_lower = query.lower().strip()
    if not query_lower:
        return 1

    tokens = [token for token in query_lower.split() if token]
    score = 0
    if query_lower in haystack:
        score += 4
    score += sum(1 for token in tokens if token in haystack)
    return score


def search_category(category: str, query: Optional[str], limit: int = 10) -> list[dict]:
    try:
        records = load_category_records(category)
    except KeyError as exc:
        raise HTTPException(
            status_code=404, detail=f"Unknown category: {category}"
        ) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if not query:
        return records[:limit]

    scored = []
    for record in records:
        score = score_record(record, query)
        if score > 0:
            scored.append((score, record))

    scored.sort(
        key=lambda item: (
            -item[0],
            str(item[1].get(CATEGORY_CONFIG[category]["location_field"], "")).lower(),
            str(item[1].get("Name", item[1].get("Flight_No", ""))).lower(),
        )
    )
    return [record for _, record in scored[:limit]]


def detect_location(message: str) -> Optional[str]:
    lowered = message.lower()
    for location in known_locations():
        if location.lower() in lowered:
            return location
    return None


def format_record(category: str, record: dict) -> str:
    if category == "restaurants":
        return (
            f"{record['Name']} in {record['City']} is a {record['Category']} spot "
            f"priced {record['Price']} with a {record['Rating']} rating."
        )
    if category == "attractions":
        return (
            f"{record['Name']} in {record['City']} is a {record['Category']} attraction "
            f"with admission {record['Admission']} and a {record['Rating']} rating."
        )
    if category == "hotels":
        return (
            f"{record['Name']} in {record['City']} is a {record['Category']} stay "
            f"at {record['Rate']} with amenities like {record['Amenities']}."
        )
    return (
        f"{record['Airline']} flight {record['Flight_No']} goes from {record['Origin']} "
        f"to {record['Destination']} for {record['Price']} in about {record['Duration']}."
    )


def search_with_location_fallback(
    category: str, message: str, location: Optional[str], limit: int = 3
) -> list[dict]:
    if location:
        location_results = search_category(category, location, limit=limit)
        exact_matches = [
            record
            for record in location_results
            if str(record.get(CATEGORY_CONFIG[category]["location_field"], "")).lower()
            == location.lower()
        ]
        if exact_matches:
            return exact_matches[:limit]

    results = search_category(category, message, limit=limit)
    if location:
        exact_matches = [
            record
            for record in results
            if str(record.get(CATEGORY_CONFIG[category]["location_field"], "")).lower()
            == location.lower()
        ]
        if exact_matches:
            return exact_matches[:limit]

    if results:
        return results
    if location:
        return search_category(category, location, limit=limit)
    return []


def build_local_chat_response(message: str) -> str:
    location = detect_location(message)
    lowered = message.lower()
    requested_categories = [
        category
        for category, keywords in CATEGORY_KEYWORDS.items()
        if any(keyword in lowered for keyword in keywords)
    ]

    if any(keyword in lowered for keyword in TRIP_KEYWORDS):
        sections = []
        for category in ["flights", "hotels", "attractions", "restaurants"]:
            results = search_with_location_fallback(
                category, message, location, limit=1
            )
            if results:
                sections.append(f"- {format_record(category, results[0])}")

        if sections:
            intro = (
                f"Here is a starter trip plan for {location}:"
                if location
                else "Here is a starter Texas trip plan:"
            )
            return "\n".join(
                [
                    intro,
                    *sections,
                    "Ask me to narrow this by city, budget, or category.",
                ]
            )

    if len(requested_categories) == 1:
        category = requested_categories[0]
        results = search_with_location_fallback(category, message, location, limit=3)
        if results:
            intro = (
                f"Here are some {category} options in {location}:"
                if location and category != "flights"
                else f"Here are some {category} options from the Texas demo data:"
            )
            lines = [intro]
            lines.extend(f"- {format_record(category, record)}" for record in results)
            return "\n".join(lines)

    combined = []
    for category in ["restaurants", "attractions", "hotels"]:
        results = search_with_location_fallback(category, message, location, limit=1)
        if results:
            combined.append(f"- {format_record(category, results[0])}")

    flight_results = search_with_location_fallback(
        "flights", message, location, limit=1
    )
    if flight_results:
        combined.append(f"- {format_record('flights', flight_results[0])}")

    if combined:
        intro = (
            f"Here are a few options I found for {location}:"
            if location
            else "Here are a few options from the local Explore Texas dataset:"
        )
        return "\n".join([intro, *combined])

    return (
        "I could not find a precise match in the local Texas datasets yet. "
        "Try asking about a city like Austin, Houston, Dallas, or San Antonio, "
        "or ask for restaurants, hotels, attractions, or flights."
    )


@app.get("/")
async def root():
    return {"message": "Explore Texas API is running"}


@app.get("/api/explore/{category}")
async def explore(category: str, q: Optional[str] = None):
    results = search_category(category, q, limit=10)
    return {"data": results, "count": len(results), "mode": "local-csv"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        azure_response = azure_client.query_explore_texas(
            request.message, request.history
        )
        if azure_response:
            return {"response": azure_response, "mode": "azure-prompt-flow"}
    except RuntimeError:
        pass

    return {
        "response": build_local_chat_response(request.message),
        "mode": "local-csv",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
