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

