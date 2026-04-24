import { useState, useCallback } from 'react';
import { api, JiraTicket, JiraConfig } from '../services/api';

export function useJira() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<JiraTicket | null>(null);
  const [recentTickets, setRecentTickets] = useState<JiraTicket[]>([]);
  const [config, setConfig] = useState<JiraConfig | null>(null);

  const fetchTicket = useCallback(async (ticketId: string) => {
    setLoading(true);
    setError(null);
    setTicket(null);
    try {
      console.log('useJira: fetching ticket', ticketId);
      const result = await api.jira.fetch(ticketId);
      console.log('useJira: received result', result);
      setTicket(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch ticket';
      console.error('useJira: error', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRecentTickets = useCallback(async () => {
    try {
      const tickets = await api.jira.getRecent();
      setRecentTickets(tickets);
    } catch (err) {
      console.error('Failed to load recent tickets:', err);
    }
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      const cfg = await api.settings.getJira();
      setConfig(cfg);
    } catch (err) {
      console.error('Failed to load JIRA config:', err);
    }
  }, []);

  const saveConfig = useCallback(async (baseUrl: string, username: string, apiToken: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.settings.saveJira({ baseUrl, username, apiToken });
      await loadConfig();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save config';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConfig]);

  return {
    loading,
    error,
    ticket,
    recentTickets,
    config,
    fetchTicket,
    loadRecentTickets,
    loadConfig,
    saveConfig,
  };
}
