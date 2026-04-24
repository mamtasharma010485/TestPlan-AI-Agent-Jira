import { getDb } from './database.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const GROQ_API_BASE = 'https://api.groq.com';
const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';

const OPENAI_API_BASE = 'https://api.openai.com/v1';
const OPENAI_DEFAULT_MODEL = 'gpt-4o-mini';

let groqApiKey = null;
let openaiApiKey = null;
let ollamaBaseUrl = 'http://localhost:11434';

export async function initLLMClients() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM llm_config WHERE id = 1', async (err, row) => {
      if (err || !row) {
        groqApiKey = null;
        openaiApiKey = null;
        resolve();
        return;
      }
      
      if (row.groq_api_key_encrypted) {
        const key = decrypt(row.groq_api_key_encrypted);
        if (key && typeof key === 'string' && key.length > 0) {
          groqApiKey = key.trim();
        } else {
          groqApiKey = null;
        }
      } else {
        groqApiKey = null;
      }
      
      if (row.openai_api_key_encrypted) {
        const key = decrypt(row.openai_api_key_encrypted);
        if (key && typeof key === 'string' && key.length > 0) {
          openaiApiKey = key.trim();
        } else {
          openaiApiKey = null;
        }
      } else {
        openaiApiKey = null;
      }
      
      ollamaBaseUrl = row.ollama_base_url || 'http://localhost:11434';
      resolve();
    });
  });
}

export async function testGroqConnection(apiKey, model) {
  try {
    const response = await fetch(`${GROQ_API_BASE}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || GROQ_DEFAULT_MODEL,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return { connected: true, response: data.choices?.[0]?.message?.content };
  } catch (err) {
    throw new Error(`Groq connection failed: ${err.message}`);
  }
}

export async function testOllamaConnection(baseUrl, model) {
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3',
        prompt: 'Hello',
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }
    
    const data = await response.json();
    return { connected: true, response: data.response };
  } catch (err) {
    throw new Error(`Ollama connection failed: ${err.message}`);
  }
}

export async function getOllamaModels(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (err) {
    throw new Error(`Failed to fetch Ollama models: ${err.message}`);
  }
}

export async function generateTestPlan(provider, prompt, options = {}) {
  await initLLMClients();
  
  const config = await getLLMConfig();
  const { model, temperature } = options;
  
  let finalModel = model || config.groq_model || GROQ_DEFAULT_MODEL;
  
  if (provider === 'groq') {
    if (!groqApiKey) {
      throw new Error('Groq not configured. Please configure in Settings.');
    }
    return generateWithGroq(prompt, finalModel, temperature || config.groq_temperature);
  } else if (provider === 'openai') {
    if (!openaiApiKey) {
      throw new Error('OpenAI not configured. Please configure in Settings.');
    }
    return generateWithOpenAI(prompt, model || config.openai_model || OPENAI_DEFAULT_MODEL, temperature || config.openai_temperature || 0.7);
  } else if (provider === 'ollama') {
    return generateWithOllama(prompt, model || config.ollama_model);
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}

async function generateWithGroq(prompt, model, temperature) {
  if (!groqApiKey) {
    throw new Error('Groq not configured. Please configure in Settings.');
  }
  
  try {
    console.log('Calling Groq API with model:', model);
    const response = await fetch(`${GROQ_API_BASE}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a QA Engineer. Generate a comprehensive test plan based on the provided JIRA ticket and following the structure of the template provided. Include specific test scenarios, test cases, and acceptance criteria validation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature || 0.7,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    throw new Error(`Groq generation failed: ${err.message}`);
  }
}

async function generateWithOllama(prompt, model) {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama3',
        prompt: `You are a QA Engineer. Generate a comprehensive test plan based on the provided JIRA ticket and following the structure of the template provided. Include specific test scenarios, test cases, and acceptance criteria validation.\n\n${prompt}`,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }
    
    const data = await response.json();
    return data.response || '';
  } catch (err) {
    throw new Error(`Ollama generation failed: ${err.message}`);
  }
}

async function generateWithOpenAI(prompt, model, temperature) {
  if (!openaiApiKey) {
    throw new Error('OpenAI not configured. Please configure in Settings.');
  }
  
  try {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || OPENAI_DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a QA Engineer. Generate a comprehensive test plan based on the provided JIRA ticket and following the structure of the template provided. Include specific test scenarios, test cases, and acceptance criteria validation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature || 0.7,
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    throw new Error(`OpenAI generation failed: ${err.message}`);
  }
}

function getLLMConfig() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM llm_config WHERE id = 1', (err, row) => {
      if (err) reject(err);
      else resolve(row || {});
    });
  });
}

export async function saveLLMConfig(config) {
  const { provider, groqApiKey, groqModel, groqTemperature, openaiApiKey, openaiModel, openaiTemperature, ollamaBaseUrl: ollamaUrl, ollamaModel } = config;
  
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run(
      `UPDATE llm_config SET 
       provider = ?,
       groq_api_key_encrypted = ?,
       groq_model = ?,
       groq_temperature = ?,
       openai_api_key_encrypted = ?,
       openai_model = ?,
       openai_temperature = ?,
       ollama_base_url = ?,
       ollama_model = ?
       WHERE id = 1`,
      [
        provider || 'groq',
        groqApiKey ? encrypt(groqApiKey) : null,
        groqModel || GROQ_DEFAULT_MODEL,
        groqTemperature ?? 0.7,
        openaiApiKey ? encrypt(openaiApiKey) : null,
        openaiModel || OPENAI_DEFAULT_MODEL,
        openaiTemperature ?? 0.7,
        ollamaUrl || 'http://localhost:11434',
        ollamaModel || 'llama3'
      ],
      async (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        await initLLMClients();
        resolve();
      }
    );
  });
}

export async function getLLMConfigPublic() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT provider, groq_model, groq_temperature, openai_model, openai_temperature, ollama_base_url, ollama_model FROM llm_config WHERE id = 1', (err, row) => {
      if (err) reject(err);
      else resolve(row || { provider: 'groq' });
    });
  });
}