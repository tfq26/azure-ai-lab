import os
import pandas as pd
from dotenv import load_dotenv

# This script simulates a RAG (Retrieval-Augmented Generation) system.
# In Azure AI Foundry, you can automate this indexing, but here we show the LOGIC.

def custom_rag_logic(user_query, dataset_path):
    print(f"\n--- Processing Query: '{user_query}' using {os.path.basename(dataset_path)} ---")
    
    # 1. LOAD CUSTOM DATA
    df = pd.read_csv(dataset_path)
    
    # 2. SIMULATE SEARCH (In Foundry, this would be a Vector Search)
    # We'll just look for keywords in the 'Description' or 'Content' columns.
    keywords = user_query.lower().split()
    results = df[df.apply(lambda row: any(k in str(row).lower() for k in keywords), axis=1)]
    
    if results.empty:
        context = "No specific match found in our local records."
    else:
        # Take the top 2 matches as context
        context = results.head(2).to_string()

    # 3. BUILD PROMPT WITH CONTEXT
    prompt = f"""
    You are an expert University Assistant. 
    Use the following PRIVATE records to answer the student's question.
    If the information is not in the records, say you don't know based on provided data.

    RECORDS:
    {context}

    QUESTION: {user_query}
    """
    
    print("--- CONTEXT EXTRACTED FROM CUSTOM DATA ---")
    print(context)
    print("\n--- FINAL PROMPT SENT TO MODEL ---")
    print("(Sending this to Azure AI Foundry model for processing...)")
    
    # (In a real app, you'd send 'prompt' to client.inference.get_chat_completions as in 01_starter.py)
    print("\n[SIMULATED AI RESPONSE]")
    if not results.empty:
        print("Based on our course catalog, the course you're looking for is listed with specific prerequisites and credits...")
    else:
        print("I'm sorry, I couldn't find that in our records. Please check the registrar's office.")

if __name__ == "__main__":
    # Demo with the Course Catalog
    custom_rag_logic("Tell me about Intro to Programming", "data/course_catalog.csv")
    
    # Demo with Dining
    custom_rag_logic("What is for lunch on Monday?", "data/dining_menus.csv")
