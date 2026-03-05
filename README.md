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

## Datasets Provided
We have provided four CSV/Text datasets in the `data/` folder:
1.  **University Course Catalog**: Descriptions of classes and prerequisites.
2.  **Campus Dining Menus**: Nutrition info and daily specials.
3.  **Student Financial FAQs**: Information on tuition, scholarships, and deadlines.
4.  **Local City Guide**: Points of interest around the campus.

> [!TIP]
> **Don't like these topics?** Use the `PROMPT_DATA_GEN.md` file to ask an AI to generate a custom dataset for you!
