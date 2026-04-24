# Findings

## North Star
Build a full-stack web application that automates test plan creation by integrating JIRA ticket data with LLM-powered analysis using customizable templates. Support both cloud (Groq API) and local (Ollama) LLM providers.

## Integrations
- **JIRA**: REST API v3 (Atlassian)
- **LLM Providers**: Groq API + Ollama local REST API
- **Storage**: Local SQLite + File system

## Source of Truth
JIRA issues/stories - pull requirements directly from JIRA epics/stories

## Delivery
JIRA test execution + Reports (HTML/dashboard)

## Tech Stack
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js (Express) or Python (FastAPI) - choose one
- **Storage**: Local SQLite + File system
- **LLM**: Groq API SDK + Ollama

## Project Structure
```
/intelligent-test-plan-agent
├── /frontend
├── /backend
├── /templates
└── README.md
```

## Research Findings

### JIRA Integration
- Use axios with Basic Auth (email + API token)
- Endpoint: `GET /rest/api/3/issue/{issueKey}`
- Alternative: `jira-client` npm package
- CORS: Must go through backend (not direct from browser)

### LLM Integration
- **Groq**: Direct HTTP to `api.groq.com/openai/v1/chat/completions`
- **Ollama**: Use official `ollama` npm package (`npm i ollama`)
- Both support streaming via AsyncIterator

### PDF Parsing
- Use `pdf-parse` or `pdf2json` npm packages

### Key Decisions Made
1. **Backend**: Node.js + Express
2. **LLM**: Support both Groq (cloud) and Ollama (local)