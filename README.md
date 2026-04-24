# TestPlan AI Agent (Jira Integration)

An intelligent automation agent designed to generate comprehensive test plans directly from Jira tickets using advanced LLMs (Groq and Ollama). Built with the B.L.A.S.T. protocol for deterministic and reliable automation.

## 🚀 Features

- **Jira Integration**: Fetch ticket details (summary, description, priority, acceptance criteria) using Jira API.
- **AI-Powered Generation**: Generate detailed test plans using either cloud-based (Groq - Llama3) or local (Ollama) models.
- **Template Management**: Upload PDF templates to define the structure of your test plans. The agent automatically extracts sections for consistent output.
- **Real-time Updates**: Experience live test plan generation with Server-Sent Events (SSE).
- **History Tracking**: Keep track of all generated test plans and linked Jira tickets.
- **Secure Configuration**: Backend-encrypted storage for Jira credentials and LLM API keys.

## 🏗️ Architecture

The project follows the **A.N.T. 3-layer architecture**:
1. **Architecture Layer (`architecture/`)**: Defines SOPs and logic for the agent.
2. **Navigation Layer**: Handles UI interactions and flow control.
3. **Tools Layer (`tools/`)**: Python and JavaScript utilities for specific tasks like PDF parsing and Jira interaction.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vite + React + TypeScript
- **Styling**: TailwindCSS + Lucide React (Icons)
- **State Management**: Custom hooks with Fetch API

### Backend
- **Runtime**: Node.js (Express)
- **Database**: SQLite3 (Local storage for tickets, history, and settings)
- **Integrations**: 
  - `jira-client` for Atlassian connectivity.
  - `groq` & `ollama` for LLM orchestration.
  - `pdf-parse` for template processing.

## 🚦 Getting Started

### Prerequisites
- Node.js (>= 18.0.0)
- Ollama (optional, for local LLM support)
- Jira API Token

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git
   cd TestPlan-AI-Agent-Jira
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Update with your environment variables
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

## 📄 Data Schemas

The project uses standardized JSON schemas for all entities:
- **JiraConfig**: Stores base URL, username, and encrypted API token.
- **TestPlan**: Markdown-based test plans linked to Jira tickets and templates.
- **Template**: Structure extracted from uploaded PDF files.

## 🛡️ Behavioral Rules
- **Security**: API keys are never stored in the browser's localStorage.
- **Validation**: Strict regex validation for Jira IDs (`^[A-Z]+-\d+$`).
- **Resilience**: 3 attempts with exponential backoff for LLM calls.

## 📝 License
MIT
