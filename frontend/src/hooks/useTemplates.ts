import { useState, useCallback } from 'react';
import { api, Template } from '../services/api';

export function useTemplates() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.templates.list();
      setTemplates(list);
      const defaultTemplate = list.find(t => t.isDefault) || list[0] || null;
      setActiveTemplate(defaultTemplate);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load templates';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadTemplate = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const template = await api.templates.upload(file);
      setTemplates(prev => [...prev, template]);
      setActiveTemplate(template);
      return template;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTemplate = useCallback((template: Template) => {
    setActiveTemplate(template);
  }, []);

  return {
    loading,
    error,
    templates,
    activeTemplate,
    loadTemplates,
    uploadTemplate,
    selectTemplate,
  };
}
