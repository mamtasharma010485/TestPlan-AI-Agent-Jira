# Project Constitution

## Data Schemas

### JiraConfig
```json
{
  "baseUrl": "https://company.atlassian.net",
  "username": "user@email.com",
  "apiToken": "encrypted_string",
  "connected": true,
  "lastVerified": "ISO8601"
}
```

### LLMConfig
```json
{
  "provider": "groq" | "ollama",
  "groq": {
    "apiKey": "encrypted_string",
    "model": "llama3-70b-8192",
    "temperature": 0.7
  },
  "ollama": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3"
  }
}
```

### JiraTicket
```json
{
  "ticketId": "VWO-123",
  "summary": "string",
  "description": "string",
  "priority": "Highest|High|Medium|Low|Lowest",
  "status": "string",
  "assignee": "string",
  "labels": ["string"],
  "acceptanceCriteria": ["string"],
  "attachments": ["{filename, url}"],
  "fetchedAt": "ISO8601"
}
```

### Template
```json
{
  "id": "uuid",
  "name": "string",
  "content": "string",
  "structure": ["section1", "section2"],
  "isDefault": boolean,
  "uploadedAt": "ISO8601"
}
```

### TestPlan
```json
{
  "id": "uuid",
  "ticketId": "string",
  "templateId": "uuid",
  "content": "markdown_string",
  "generatedAt": "ISO8601",
  "provider": "groq" | "ollama"
}
```

### HistoryEntry
```json
{
  "id": "uuid",
  "ticketId": "string",
  "testPlanId": "uuid",
  "createdAt": "ISO8601"
}
```

## API Endpoints

### Settings
- `POST /api/settings/jira` - Save JIRA credentials
- `GET /api/settings/jira` - Get connection status
- `POST /api/settings/llm` - Save LLM config
- `GET /api/settings/llm/models` - List available Ollama models

### Jira
- `POST /api/jira/fetch` - Body: `{ticketId: "VWO-123"}`
- `GET /api/jira/recent` - Get recently fetched tickets

### TestPlan
- `POST /api/testplan/generate` - Body: `{ticketId, templateId, provider}`
- `GET /api/testplan/stream` - SSE for real-time generation

### Templates
- `POST /api/templates/upload` - Multipart form data (PDF)
- `GET /api/templates` - List available templates

## Behavioral Rules

1. **Security**: Never store API keys in localStorage. Use backend encryption.
2. **Validation**: Sanitize JIRA IDs with regex `^[A-Z]+-\d+$`
3. **Timeouts**: 30s for Groq, 120s for Ollama
4. **Retry**: 3 attempts with exponential backoff
5. **PDF Limit**: Max 5MB file size
6. **CORS**: Restrict to localhost only

## Architectural Invariants

1. Backend must validate all credentials before storing
2. Frontend receives data via REST API only
3. Template structure extracted on upload, stored as JSON
4. All timestamps in ISO8601 format