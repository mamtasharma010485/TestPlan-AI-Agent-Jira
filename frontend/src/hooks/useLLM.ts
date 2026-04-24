import { useState, useCallback } from 'react';
import { api, LLMConfig } from '../services/api';

export function useLLM() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<LLMConfig | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await api.settings.getLLM();
      setConfig(cfg as LLMConfig);
    } catch (err) {
      console.error('Failed to load LLM config:', err);
    }
  }, []);

  const loadOllamaModels = useCallback(async () => {
    try {
      const response = await api.settings.getOllamaModels();
      setOllamaModels(response.models?.map(m => m.name) || []);
    } catch (err) {
      console.error('Failed to load Ollama models:', err);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: LLMConfig & { groqApiKey?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await api.settings.saveLLM(newConfig);
      await loadConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save config';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConfig]);

  const testGroqConnection = useCallback(async (apiKey: string, model: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.settings.saveLLM({
        provider: 'groq',
        groqApiKey: apiKey,
        groq: { model, temperature: 0.7 },
        ollama: { baseUrl: 'http://localhost:11434', model: 'llama3' },
      });
      return { connected: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Groq connection failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const testOllamaConnection = useCallback(async (baseUrl: string, model: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: 'Hello', stream: false }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama returned ${response.status}`);
      }
      
      return { connected: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ollama connection failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    config,
    ollamaModels,
    loadConfig,
    loadOllamaModels,
    saveConfig,
    testGroqConnection,
    testOllamaConnection,
  };
}
