# Azure AI Foundry Campus Lab: Custom AI Intelligence Hub

Welcome to the Azure AI Foundry hands-on lab! This project is designed for college students to explore building **viable** custom AI models and applications.

## Why Azure AI Foundry?
Most students start with a simple API call to ChatGPT. However, building a *real* application requires:
1.  **Management**: Organizing models, API keys, and configurations in one place.
2.  **Custom Data (RAG)**: Making the AI knowledgeable about *your* specific documents (like a university handbook).
3.  **Tools & Orchestration**: Giving the AI "hands" to perform calculations or look up live data.
4.  **Evaluation**: Scientifically measuring if the AI is actually performing well.

## Project Structure
- `data/`: Contains 4 sample datasets to get you started.
- `src/01_starter.py`: The "Hello World" of Azure AI Foundry.
- `src/02_custom_rag.py`: Integrating the datasets into the AI's "brain."
- `src/03_live_challenge.py`: A template for you to write your own custom logic.
- `src/04_evaluation.py`: How to grade your AI's performance.
- `WORKSHOP_LEADER_GUIDE.md`: How to teach the workshop, explain the Azure services, and run a reliable demo.

## Datasets Provided
We have provided four CSV/Text datasets in the `data/` folder:
1.  **Restaurants**: Texas city, restaurant name, cuisine category, price, and rating.
2.  **Attractions**: Texas city, attraction name, attraction type, admission price, and rating.
3.  **Hotels**: Texas city, hotel name, stay category, nightly rate, and amenities.
4.  **Flights**: Origin city, destination city, airline, flight number, price, and duration.

> [!TIP]
> **Want a different location or theme?** Use `PROMPT_DATA_GEN.md` as a starting point, or follow `WORKSHOP_LEADER_GUIDE.md` for the recommended config-driven customization approach.
