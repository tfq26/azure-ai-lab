import os
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()


class AzureTexasClient:
    def __init__(self):
        self.pf_endpoint = os.getenv("AZURE_PROMPT_FLOW_ENDPOINT")
        self.pf_key = os.getenv("AZURE_PROMPT_FLOW_KEY")

    @property
    def is_configured(self) -> bool:
        return bool(self.pf_endpoint and self.pf_key)

    def query_explore_texas(self, message: str, history: Optional[list[dict]] = None) -> Optional[str]:
        if not self.is_configured:
            return None

        payloads = [
            {"question": message, "chat_history": history or []},
            {"message": message, "history": history or []},
            {"inputs": {"question": message, "chat_history": history or []}},
        ]
        headers_list = [
            {
                "Authorization": f"Bearer {self.pf_key}",
                "Content-Type": "application/json",
            },
            {
                "api-key": self.pf_key,
                "Content-Type": "application/json",
            },
        ]

        last_error = None
        for headers in headers_list:
            for payload in payloads:
                try:
                    response = requests.post(
                        self.pf_endpoint,
                        headers=headers,
                        json=payload,
                        timeout=30,
                    )
                    response.raise_for_status()
                    text = self._extract_text(response.json())
                    if text:
                        return text
                except requests.RequestException as exc:
                    last_error = exc
                except ValueError as exc:
                    last_error = exc

        if last_error:
            raise RuntimeError(f"Azure Prompt Flow request failed: {last_error}") from last_error

        raise RuntimeError("Azure Prompt Flow request succeeded but returned no readable text.")

    def _extract_text(self, payload) -> Optional[str]:
        if isinstance(payload, str):
            return payload

        if not isinstance(payload, dict):
            return None

        direct_keys = ["response", "answer", "output", "result", "generated_text"]
        for key in direct_keys:
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value

        choices = payload.get("choices")
        if isinstance(choices, list) and choices:
            first_choice = choices[0]
            if isinstance(first_choice, dict):
                message = first_choice.get("message", {})
                if isinstance(message, dict):
                    content = message.get("content")
                    if isinstance(content, str) and content.strip():
                        return content

        nested_keys = ["outputs", "predictions", "data"]
        for key in nested_keys:
            nested = payload.get(key)
            if isinstance(nested, list) and nested:
                text = self._extract_text(nested[0])
                if text:
                    return text
            if isinstance(nested, dict):
                text = self._extract_text(nested)
                if text:
                    return text

        return None


azure_client = AzureTexasClient()
