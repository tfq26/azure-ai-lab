# Workshop Leader Guide

This guide is for the student club leader who needs two things:

1. A clean way to teach the project and explain the Azure architecture.
2. A version of the app that you can demo reliably before students start building.

## What To Tell Students

Frame the project as a full AI application, not just a model call.

- The frontend is the travel website students interact with.
- The backend is the bridge between the UI, the datasets, and Azure services.
- The data layer stores structured travel records for restaurants, attractions, hotels, and flights.
- Azure services make the app searchable, orchestrated, and production-shaped.

Use this sentence early:

> "The point of this workshop is not just to call GPT. It is to show how data, retrieval, orchestration, and evaluation turn a model into an application."

## Recommended Workshop Flow

For a 75 to 90 minute club session:

1. Start with the working app demo.
2. Show the four datasets and explain why structured data matters.
3. Walk through the backend routes:
   - `GET /api/explore/{category}`
   - `POST /api/chat`
4. Explain the Azure architecture.
5. Let students wire one missing cloud piece at a time.
6. End with an extension challenge such as a new city or a new dataset.

## How To Explain Each Azure Service

### Azure Blob Storage

Use this explanation:

"Blob Storage is where our raw travel datasets live. It is the source of truth for the CSV files that Azure services ingest."

What students should understand:

- It stores the CSV files.
- It is cheap and simple.
- It is not the search engine.
- It is the input source for indexing.

### Azure AI Search

Use this explanation:

"Azure AI Search is the retrieval layer. It turns raw files into searchable indexes so the app can find the right records quickly."

What students should understand:

- It creates indexes from the CSV files.
- It supports keyword retrieval and structured filtering.
- It is what makes RAG retrieval fast enough for an app.
- Each dataset should map to its own index in this project.

### Azure OpenAI

Use this explanation:

"Azure OpenAI is the model layer. It generates the final answer, but only after retrieval has found the useful records."

What students should understand:

- `gpt-4o` is the reasoning and response model in the current design.
- Embeddings are used when the retrieval system needs vector search.
- The model should not invent travel details when the dataset does not contain them.

### Azure AI Foundry / Prompt Flow

Use this explanation:

"Foundry is the orchestration layer. It connects the prompt, the search tools, and the model into one repeatable flow."

What students should understand:

- Prompt Flow defines the chat workflow.
- It can route questions to the right search index.
- It is the cleanest place to show tool orchestration in a workshop.
- The deployed online endpoint is what your backend can call.

### Azure Machine Learning

Only mention this as optional.

Use this explanation:

"Azure Machine Learning is not required for the base app. It becomes relevant if we want evaluation pipelines, training workflows, or more advanced experimentation."

## Demo Strategy

Do not rely on cloud wiring for your first live demo. Use two demo modes.

### Demo Mode 1: Local Baseline

This repo now supports a local CSV-backed mode in the backend.

What this gives you:

- `GET /api/explore/{category}` returns real data from the CSV files.
- `POST /api/chat` returns a local trip-planning response from the datasets.
- If Azure Prompt Flow is configured, the backend will try Azure first.
- If Azure is not configured or fails, the local mode still works.

Use this mode for:

- Club leader rehearsal
- Classroom backup plan
- First 10 minutes of the workshop

### Demo Mode 2: Azure-Backed Version

Once your Azure resources are ready:

1. Upload the CSV files to Blob Storage.
2. Create Azure AI Search indexes.
3. Build the Prompt Flow in Azure AI Foundry.
4. Deploy the flow to an online endpoint.
5. Set `AZURE_PROMPT_FLOW_ENDPOINT` and `AZURE_PROMPT_FLOW_KEY` in `backend/.env`.
6. Re-run the backend and test `POST /api/chat`.

Use this mode for:

- Explaining real cloud orchestration
- Showing the difference between local fallback and managed AI workflow

## Recommended Rehearsal Checklist

Run this before the workshop.

1. Backend:

```bash
cd backend
python3 main.py
```

2. Frontend:

```bash
cd frontend
npm run dev
```

3. Verify these flows:

- Search for `Austin` in restaurants.
- Search for `Dallas` in hotels.
- Ask for a weekend plan in `San Antonio`.
- Ask for flights to `Houston`.

If Azure is configured, also verify that chat responses switch to Azure mode.

## What "Works 100%" Should Mean For Your Demo

For this workshop, "works 100%" should mean:

- The frontend loads without broken routes.
- Explore search returns real records.
- Chat returns a useful answer every time.
- The app still works if Azure is temporarily unavailable.
- You can explain where Azure would plug in even when running the local fallback.

That is the right standard for a student club demo. Do not define success as "every student resource deploys perfectly on the first try."

## Recommendation On Your Customization Idea

Yes, the customization idea is good. The only issue is sequencing.

It is a strong workshop extension because:

- Students care more when the app reflects a place they chose.
- It turns the project from a fixed demo into a reusable pattern.
- It gives you a natural way to teach modular data generation and retrieval design.

It becomes risky if you add all of it to the base workshop at once.

## Recommended Scope Split

### Phase 1: Keep The Core Workshop Stable

Keep these fixed for the base session:

- Texas-themed default datasets
- Four categories: restaurants, attractions, hotels, flights
- One consistent UI and prompt structure

This keeps the workshop predictable.

### Phase 2: Add Location-Driven Dataset Generation

This should be your first extension.

Design target:

- Input: `location`, optional restaurant categories, optional naming overrides
- Output: four CSV files using the same schema the app already expects

Implementation advice:

- Keep the schema stable even when the location changes.
- Treat `Texas` as the default config.
- Let students override only a few fields at first:
  - location
  - restaurant categories
  - optional naming theme

Do not make the schema dynamic. That will complicate Azure AI Search setup and frontend rendering.

### Phase 3: Add Airport Lookup

This is a good advanced feature, not a base requirement.

Recommended design:

- Add a small backend endpoint that accepts up to 10 origin cities.
- Resolve each city to one or more airport codes.
- Use that to generate flight rows or filter flight search.

Keep it simple:

- Start with a curated airport mapping file for the top cities students are likely to use.
- Do not start with a live external API dependency unless you need it.
- If you later add an external airport API, keep the local mapping as fallback.

## Suggested Architecture For The Customization Extension

Use a config-driven generator instead of editing arrays in code.

Recommended config shape:

```json
{
  "location": "Chicago",
  "regionType": "city",
  "restaurantCategories": ["Deep Dish", "Steakhouse", "Cafe"],
  "restaurantNames": ["Lakefront", "Windy City", "Magnolia"],
  "restaurantNouns": ["Kitchen", "Grill", "Table"],
  "hotelThemes": ["Boutique", "Luxury", "Budget"],
  "attractionThemes": ["Museum", "Architecture", "Park"],
  "flightOrigins": ["Dallas", "Austin", "Atlanta"]
}
```

Rules:

- Preserve the existing CSV columns.
- Only swap the values used to generate rows.
- Keep default values in the repo so the workshop still runs without custom input.

## What To Avoid

- Do not make students build Azure, frontend, backend, prompt logic, and custom data generation all in the first session.
- Do not make the flight system depend on a third-party API for the base demo.
- Do not make each category use a different schema per location.
- Do not remove the Texas default; keep it as the reliable fallback.

## Recommended Messaging To Students

Use this sequence:

1. "First we will run the app with a stable local dataset."
2. "Then we will connect that app to Azure retrieval and orchestration."
3. "If we finish early, we will customize the app for a place you choose."

That order keeps the workshop teachable.
