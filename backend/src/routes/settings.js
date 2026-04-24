import { Router } from 'express';
import { testConnection, saveJiraConfig, getJiraConnectionStatus, initJiraClient } from '../services/jira-client.js';
import { testGroqConnection, testOllamaConnection, getOllamaModels, saveLLMConfig, getLLMConfigPublic, initLLMClients } from '../services/llm-providers.js';

const router = Router();

router.post('/jira', async (req, res) => {
  try {
    const { baseUrl, username, apiToken } = req.body;
    
    if (!baseUrl || !username || !apiToken) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    await testConnection({ baseUrl, username, apiToken });
    await saveJiraConfig({ baseUrl, username, apiToken });
    
    res.json({ success: true, message: 'JIRA configuration saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/jira', async (req, res) => {
  try {
    const status = await getJiraConnectionStatus();
    res.json(status || { connected: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/llm', async (req, res) => {
  try {
    const { provider, groqApiKey, groqModel, groqTemperature, openaiApiKey, openaiModel, openaiTemperature, ollamaBaseUrl, ollamaModel } = req.body;
    
    await saveLLMConfig({
      provider,
      groqApiKey,
      groqModel,
      groqTemperature,
      openaiApiKey,
      openaiModel,
      openaiTemperature,
      ollamaBaseUrl,
      ollamaModel
    });
    
    await initLLMClients();
    
    res.json({ success: true, message: 'LLM configuration saved' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/llm', async (req, res) => {
  try {
    const config = await getLLMConfigPublic();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/llm/test-groq', async (req, res) => {
  try {
    const { apiKey, model } = req.body;
    const result = await testGroqConnection(apiKey, model);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/llm/test-ollama', async (req, res) => {
  try {
    const { baseUrl, model } = req.body;
    const result = await testOllamaConnection(baseUrl, model);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/llm/models', async (req, res) => {
  try {
    const config = await getLLMConfigPublic();
    const models = await getOllamaModels(config.ollama_base_url || 'http://localhost:11434');
    res.json(models);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;