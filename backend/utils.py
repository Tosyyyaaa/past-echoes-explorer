from __future__ import annotations

import json
from typing import Any, Dict


def parse_json_payload(payload: str, context: str) -> Dict[str, Any]:
    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            f"Failed to parse JSON from {context}: {exc}. Payload snippet: {payload[:4000]}"
        ) from exc


def strip_code_fence(payload: str) -> str:
    """Remove common markdown code fences and json prefixes from LLM responses."""
    text = payload.strip()
    if text.startswith("```"):
        text = text[3:]
        if text.startswith("json"):
            text = text[4:]
        text = text.rstrip("`").strip()
    lower = text.lower()
    prefixes = ("json|", "json |", "json:", "json")
    for prefix in prefixes:
        if lower.startswith(prefix):
            text = text[len(prefix):]
            break
    return text.strip(" :\n\t")
