# Azure Setup Guide: Explore Texas

This guide explains how to set up the Azure resources required for the **Explore Texas** application. Students will need to complete these steps to provide the credentials for the application.

## 1. Azure Blob Storage (Data Lake)
*   **Create Storage Account**: Go to the Azure Portal and create a new Storage Account.
*   **Create Container**: Create a container named `explore-texas-data`.
*   **Upload CSVs**: Upload the 4 files from the `data/` folder:
    *   `texas_restaurants.csv`
    *   `texas_attractions.csv`
    *   `texas_hotels.csv`
    *   `texas_flights.csv`

## 2. Azure AI Search (The Search Engine)
*   **Why the Cloud?**: Local search (like `grep` or `pandas.read_csv()`) is slow and doesn't scale. Azure AI Search provides **instant, structured, and vector-based retrieval** across all 40,000 rows, which is essential for a smooth chat experience.
*   **Create Service**: Create an Azure AI Search service.
*   **Import Data**: Use the **Import Data** wizard:
    1. Connect to your Blob Storage container.
    2. Create **four separate indexes** (one for each CSV).
    3. Ensure fields like `City`, `Name`, and `Category` are **Filterable** and **Searchable**.
    4. Ensure `Price` or `Rate` are **Sortable**.

## 3. Azure OpenAI (The Brain)
*   **Deploy Models**: In Azure OpenAI Studio, deploy:
    1. `gpt-4o` (for the Chat interface).
    2. `text-embedding-3-small` (for vector search).

## 4. Azure AI Foundry (The Orchestrator)
This is where students build the "Intelligence" using **Prompt Flow**:
1.  **Create a Flow**: Create a new "Chat Flow" in Azure AI Foundry.
2.  **Add Search Tools**: Add 4 Search tools, each connected to one of the Texas indexes.
3.  **The Switch Logic**: Use a Python node or an LLM node to decide which search tool to trigger based on the user's question.
4.  **The Prompt**: Use the **System Prompt** provided in the application boilerplate.
5.  **Deploy**: Deploy the flow to an **Online Endpoint**.

## 5. Connecting the Application
Create a `.env` file in the `backend/` directory and fill in your **Prompt Flow Endpoint** and **Key**:

```env
AZURE_PROMPT_FLOW_ENDPOINT="https://your-endpoint.inference.ai.azure.com/score"
AZURE_PROMPT_FLOW_KEY="your-endpoint-key"
```

## 5. Training in Azure AI Foundry
*   Students can use **Azure Machine Learning** (AutoML) on the `loan_decision_training_data.csv` (if generated) or use **Prompt Flow** to refine the RAG logic using the Search indexes created in step 2.
