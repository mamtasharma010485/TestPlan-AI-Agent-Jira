import { useState, useCallback } from 'react';
import { api, TestPlan, HistoryEntry } from '../services/api';

export function useTestPlan() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [progress, setProgress] = useState<string>('');

  const generateTestPlan = useCallback(async (
    ticketId: string,
    templateId: string,
    provider: 'groq' | 'ollama'
  ) => {
    setGenerating(true);
    setError(null);
    setProgress('Fetching ticket...');
    
    try {
      setProgress('Analyzing context...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress('Generating test plan...');
      const result = await api.testplan.generate(ticketId, templateId, provider);
      
      setTestPlan(result);
      setProgress('Complete');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate test plan';
      setError(message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await api.testplan.getHistory();
      setHistory(entries);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTestPlan = useCallback(() => {
    setTestPlan(null);
    setProgress('');
  }, []);

  return {
    loading,
    generating,
    error,
    testPlan,
    history,
    progress,
    generateTestPlan,
    loadHistory,
    clearTestPlan,
  };
}
