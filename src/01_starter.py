import os
from dotenv import load_dotenv
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

# 1. SETUP & AUTHENTICATION
# In a real lab, you would have a .env file with your connection string.
load_dotenv()
project_connection_string = os.getenv("AZURE_AI_PROJECT_CONNECTION_STRING")

def basic_inference_demo():
    print("--- 01: STARTER DEMO ---")
    
    # Mock check: If no connection string is found, we show how it WOULD look.
    if not project_connection_string:
        print("[MOCK MODE] No Azure connection string found.")
        print("Logic: Connecting to Azure AI Foundry...")
        print("Logic: Requesting Gpt-4o chat completion...")
        print("AI Response: Hello! I am your Azure AI Campus Assistant. How can I help you today?")
        return

    # Real Connection logic
    client = AIProjectClient.from_connection_string(
        credential=DefaultAzureCredential(),
        conn_str=project_connection_string,
    )

    # Simple chat completion
    response = client.inference.get_chat_completions(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful university assistant."},
            {"role": "user", "content": "What can you do for me?"}
        ]
    )

    print(f"AI Response: {response.choices[0].message.content}")

if __name__ == "__main__":
    basic_inference_demo()
