const API_BASE = 'http://localhost:3000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export interface JiraConfig {
  baseUrl: string;
  username: string;
  connected: boolean;
  lastVerified?: string;
}

export interface LLMConfig {
  provider: 'groq' | 'ollama';
  groq?: {
    apiKey?: string;
    model: string;
    temperature: number;
  };
  ollama?: {
    baseUrl: string;
    model: string;
  };
}

export interface JiraTicket {
  ticketId: string;
  summary: string;
  description: string | object;
  priority: string;
  status: string;
  assignee: string;
  labels: string[];
  acceptanceCriteria: string[];
  attachments: { filename: string; url: string }[];
  fetchedAt: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  structure: string[];
  isDefault: boolean;
  uploadedAt: string;
}

export interface TestPlan {
  id: string;
  ticketId: string;
  templateId: string;
  content: string;
  generatedAt: string;
  provider: 'groq' | 'ollama';
}

export interface HistoryEntry {
  id: string;
  ticketId: string;
  testPlanId: string;
  createdAt: string;
}

export const api = {
  settings: {
    getJira: () => fetchApi<JiraConfig>('/settings/jira'),
    saveJira: (config: { baseUrl: string; username: string; apiToken: string }) =>
      fetchApi<{ success: boolean }>('/settings/jira', {
        method: 'POST',
        body: JSON.stringify(config),
      }),
    getLLM: () => fetchApi<LLMConfig>('/settings/llm'),
    saveLLM: (config: LLMConfig & { groqApiKey?: string }) =>
      fetchApi<{ success: boolean }>('/settings/llm', {
        method: 'POST',
        body: JSON.stringify(config),
      }),
    getOllamaModels: () => fetchApi<{ models: { name: string }[] }>('/settings/llm/models'),
  },
  
  jira: {
    fetch: (ticketId: string) =>
      fetchApi<JiraTicket>('/jira/fetch', {
        method: 'POST',
        body: JSON.stringify({ ticketId }),
      }),
    getRecent: () => fetchApi<JiraTicket[]>('/jira/recent'),
  },
  
  templates: {
    list: () => fetchApi<Template[]>('/templates'),
    upload: async (file: File): Promise<Template> => {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file:', file.name, file.size, 'bytes');
      
      const response = await fetch(`${API_BASE}/templates/upload`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      const data = await response.json();
      console.log('Upload response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload template');
      }
      
      return data;
    },
  },
  
  testplan: {
    generate: (ticketId: string, templateId: string, provider: 'groq' | 'ollama') =>
      fetchApi<TestPlan>('/testplan/generate', {
        method: 'POST',
        body: JSON.stringify({ ticketId, templateId, provider }),
      }),
    getHistory: () => fetchApi<HistoryEntry[]>('/testplan/history'),
  },
};
