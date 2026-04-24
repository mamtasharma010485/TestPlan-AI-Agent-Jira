# LinkedIn Post - AI Test Plan Generator

🚀 **I Built an AI-Powered Test Plan Generator from Scratch!** 🚀

For months, creating test plans was a tedious, time-consuming task. Reading JIRA tickets, manually copying details, formatting documentation... it took 30+ minutes that could've been spent on actual testing.

Today, I changed that by building a complete full-stack web application that automates the entire process.

---

## 🎯 What the Application Does

**Input:** JIRA Ticket ID (e.g., PROJ-123)
**Process:** 
- Fetches ticket data from JIRA automatically
- Analyzes description, acceptance criteria, priority
- Uses AI to generate comprehensive test plan
- Follows your custom PDF template structure

**Output:** Complete Markdown test plan with:
- Test Scope & Overview
- Test Scenarios
- Test Cases
- Acceptance Criteria validation
- Export-ready documentation

---

## 💻 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Shadcn/UI components
- React hooks for state management

### Backend  
- Node.js + Express
- SQLite for persistent storage
- Multer for file uploads
- PDF-parse for template extraction
- AES-256 encryption for credentials

### Integrations
- JIRA REST API v3
- Groq API (openai/gpt-oss-120b, llama-3.3-70b, mixtral)
- Ollama for local AI
- OpenAI API support

---

## 🔑 Key Features Built

✅ **JIRA Integration**
- Secure API token authentication
- Automatic ticket fetching
- ADF (Atlassian Document Format) parsing
- Recent tickets history

✅ **LLM Providers**
- Groq Cloud API (fast & affordable)
- Ollama Local AI
- OpenAI API support
- Model switching in Settings

✅ **Template Management**
- PDF upload with drag & drop
- Automatic structure extraction
- Default template fallback
- Template preview

✅ **Security**
- AES-256 encrypted credentials
- No API keys in frontend
- Secure backend storage
- CORS protection

✅ **User Experience**
- Clean sidebar navigation
- Loading states & progress indicators
- Toast notifications
- Copy/Export functionality

---

## 🏆 Impact

| Before | After |
|--------|-------|
| 30+ minutes per test plan | 30 seconds |
| Manual copy-paste | Auto-fetch from JIRA |
| Generic templates | Custom PDF structure |
| Separate documentation | All-in-one tool |

---

## 📁 Project Structure

```
intelligent-test-plan-generator/
├── backend/
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helpers
│   └── data/           # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Dashboard, Settings, History
│   │   ├── hooks/       # Custom React hooks
│   │   └── services/   # API layer
│   └── dist/           # Production build
└── templates/          # PDF templates
```

---

## 🎓 Challenges Overcome

1. **Groq SDK Issues** - The official SDK had bugs, so I rewrote it to use native fetch API
2. **Decommissioned Models** - llama3-70b and mixtral were deprecated; adapted to use new models
3. **ADF Parsing** - JIRA descriptions use Atlassian Document Format; built custom parser
4. **Encryption** - API tokens needed secure storage; implemented AES-256 encryption
5. **CORS Configuration** - Secured API endpoints while allowing frontend access

---

## 🔧 APIs Built

```
POST /api/settings/jira      # Save JIRA credentials
POST /api/settings/llm       # Save LLM configuration
POST /api/jira/fetch          # Fetch JIRA ticket
POST /api/templates/upload    # Upload PDF template
POST /api/testplan/generate   # Generate test plan
GET  /api/testplan/history    # Get generation history
```

---

## 💡 Why This Matters

As QA Engineers, we spend too much time on documentation instead of testing. This tool frees up that time for what actually matters - finding bugs and improving quality.

The AI understands context from JIRA tickets and generates structured, comprehensive test plans that follow your organization's template format.

---

## 🔗 Tech Stack Highlights

⚡ Groq API - Incredibly fast inference, affordable pricing
🗄️ SQLite - Zero-config database
⚛️ React 18 - Modern declarative UI
🔒 AES-256 Encryption - Bank-grade security

---

## 🔗 Repository Link
GitHub: [https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git](https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git)

---

## 📱 LinkedIn Post Options

### Option 1: The "Game Changer" (Problem/Solution)
🚀 **Stop wasting time on manual test plans!**

I just built a full-stack AI Agent that turns a Jira Ticket ID into a complete, structured Test Plan in under 30 seconds. ⚡

**The Problem:** Spending 30+ mins copying Jira details, formatting docs, and manually writing scenarios for every ticket.
**The Solution:** An intelligent automation agent that:
✅ Syncs directly with Atlassian Jira
✅ Parses acceptance criteria & priority
✅ Generates test plans using Groq (Llama3) or Local Ollama
✅ Maps output to your organization's PDF template

**Tech Stack:** React, Node.js, SQLite, Groq Cloud, & Ollama.

Check out the code here: https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git

#QA #SoftwareTesting #Automation #AI #Jira #BuildInPublic

---

### Option 2: The "Tech Deep Dive" (Stack-focused)
Built an AI Test Plan Generator using the **B.L.A.S.T. protocol** for deterministic automation! 🤖🛠️

This project explores the intersection of LLMs and QA workflows. Key technical highlights:
🔹 **Hybrid LLM Support:** Switch between Groq (ultra-fast cloud inference) and Ollama (fully local/private).
🔹 **Deterministic Output:** Uses structural extraction from PDF templates to ensure AI output matches company standards.
🔹 **Secure-by-Design:** AES-256 encryption for Jira tokens and backend-only credential management.
🔹 **Real-time UX:** SSE for streaming generation progress.

Built with React 18, TypeScript, and Express. 

Full source code: https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git

#NodeJS #ReactJS #LLM #Ollama #Groq #Engineering

---

### Option 3: The "Impact" (Short & Punchy)
30 minutes ➡️ 30 seconds. 

That’s how much time my new AI Agent saves per Jira ticket when generating test documentation. 

Fetch data 🔄
Analyze context 🧠
Generate plan 📝
Follow template 📋

All automated. All secure. 

Repo: https://github.com/kaundalpoonam310/TestPlan-AI-Agent-Jira.git

#QAAutomation #Productivity #AI #Jira #Testing