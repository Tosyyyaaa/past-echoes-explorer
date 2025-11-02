## Hackathon Work — London VibeHack by Eurasian Hub (1 November 2025)

This repository contains hackathon work that placed 2nd on the London VibeHack. 
Sponsors whose tools were used in the project: Perplexity, OpenAI

## PastPort — Past Echoes Explorer

Uncover historical echoes behind modern narratives. Paste a news article or a topic, and PastPort surfaces narrative analysis and historically resonant events with sources and concise consequences — helping readers reason with context, not just headlines.

### What it does
- **Narrative analysis**: Extracts tone, emotional cues, bias/frame, and key narrative facets.
- **Historical echoes**: Finds historically resonant events per facet with source links and significance.
- **Search-to-article**: If you don’t have an article, provide a query; the system discovers a credible piece to analyse.
- **Transparent prompts**: Stores the prompts used and basic metadata for traceability.

### Why it matters
- **Context combats noise**: It’s easier to think clearly about current events when you can see patterns play out over time.
- **Explainable**: Each echo includes a short justification and consequences to aid critical reading.

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                           Frontend (Vite + React + TS)             │
│  UI (shadcn-ui, Tailwind) → Calls FastAPI endpoints                │
└────────────────────────────────────────────────────────────────────┘
                 ▲                                        │
                 │ HTTP (JSON)                             │
                 │                                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                         Backend (FastAPI, Python)                  │
│  /api/analyze → pipeline →                                         │
│   - OpenAI: narrative analysis (JSON)                              │
│   - Perplexity: historical echoes (JSON)                           │
│  Output saved under output/ with metadata                          │
└────────────────────────────────────────────────────────────────────┘
```

### Core tech
- **Frontend**: Vite, React, TypeScript, shadcn‑ui, Tailwind CSS
- **Backend**: FastAPI, httpx, uvicorn, trafilatura
- **AI**: OpenAI (narrative JSON), Perplexity (echoes JSON)

## Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- API keys: `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`

## Quick start

```bash
# 1) Python env + backend deps
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 2) Frontend deps
npm i

# 3) Configure environment (recommended)
cat > .env << 'EOF'
OPENAI_API_KEY=sk-your-openai-key
PERPLEXITY_API_KEY=pplx-your-perplexity-key
EOF

# 4) Run backend (http://localhost:8000)
bash run_backend.sh

# 5) In a new terminal, run frontend (http://localhost:5173)
npm run dev
```

Notes:
- The backend enables CORS for `http://localhost:5173` (Vite default) and `http://localhost:3000`, plus a permissive `*` during hackathon testing.
- The script `run_backend.sh` will attempt to create/load `.env`. Replace any placeholder keys with your own. Never commit real keys.

## Configuration

Create `.env` with:

```bash
OPENAI_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
```

Defaults:
- OpenAI model: `gpt-4.1-mini`
- Perplexity model: `sonar`

## API reference (FastAPI)

Base URL: `http://localhost:8000`

### GET `/api/status`
Returns service status.

### POST `/api/analyze`
Analyse an article by URL, raw text, or a `searchQuery` that discovers an article for you.

### POST `/api/output/clear`
Clears the generated `output/` directory.

## Security & privacy
- Do not commit real API keys. Prefer local `.env` files and secret managers in production.
- `run_backend.sh` contains hackathon conveniences. Replace any placeholder keys with your own; treat it as development‑only.

## Limitations (hackathon cut)
- Echo discovery quality depends on external models and may vary.
- Timeouts and rate limits are minimally tuned for demo purposes.
- Deduplication/scoring can be improved with richer signals.

## Licence
Hackathon demonstration code. For use beyond the event, add an explicit licence and harden security/ops.
