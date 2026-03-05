# Prompt for Generating Custom Datasets

If you want to build your AI on a different topic (e.g., Space Exploration, Cooking Recipes, or Video Game Lore), use the following prompt with an AI like ChatGPT, Claude, or Azure OpenAI:

---

**Prompt:**
"I am a college student building a Retrieval-Augmented Generation (RAG) system in Azure AI Foundry. Generate a structured CSV dataset with 20 rows of detailed information about [INSERT TOPIC HERE]. 

Include at least 4 columns:
1. **Title/Subject** (e.g., 'Introduction to Black Holes')
2. **Category** (e.g., 'Astrophysics')
3. **Content/Details** (A 2-3 sentence detailed explanation)
4. **Metadata** (e.g., 'Source: NASA 2024 Report')

Output the result in a raw CSV format so I can save it as 'custom_data.csv'."

---

Once you have your CSV, save it in the `data/` folder and update the code in `src/02_custom_rag.py` to point to your new file!
