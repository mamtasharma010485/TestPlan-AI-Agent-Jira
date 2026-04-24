import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select } from '../ui/select';
import { Slider } from '../ui/slider';

interface LLMConfigFormProps {
  config: { provider: 'groq' | 'ollama'; groq_model?: string; groq_temperature?: number; ollama_base_url?: string; ollama_model?: string } | null;
  ollamaModels: string[];
  onSave: (config: { provider: 'groq' | 'ollama'; groqApiKey?: string; groqModel?: string; groqTemperature?: number; ollamaBaseUrl?: string; ollamaModel?: string }) => Promise<void>;
  onTestGroq: (apiKey: string, model: string) => Promise<{ connected: boolean }>;
  onTestOllama: (baseUrl: string, model: string) => Promise<{ connected: boolean }>;
  onLoadOllamaModels: () => void;
  loading?: boolean;
}

const GROQ_MODELS = [
  { value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (Recommended)' },
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
  { value: 'llama3-8b-8192', label: 'Llama 3 8B' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
];

export function LLMConfigForm({ 
  config, 
  ollamaModels, 
  onSave, 
  onTestGroq, 
  onTestOllama,
  onLoadOllamaModels,
  loading 
}: LLMConfigFormProps) {
  const [provider, setProvider] = useState<'groq' | 'ollama'>(config?.provider || 'groq');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState(config?.groq_model || 'openai/gpt-oss-120b');
  const [groqTemperature, setGroqTemperature] = useState(config?.groq_temperature || 0.7);
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(config?.ollama_base_url || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(config?.ollama_model || 'llama3');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (provider === 'ollama') {
      onLoadOllamaModels();
    }
  }, [provider, onLoadOllamaModels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        provider,
        groqApiKey: provider === 'groq' ? groqApiKey : undefined,
        groqModel: provider === 'groq' ? groqModel : undefined,
        groqTemperature: provider === 'groq' ? groqTemperature : undefined,
        ollamaBaseUrl: provider === 'ollama' ? ollamaBaseUrl : undefined,
        ollamaModel: provider === 'ollama' ? ollamaModel : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleTestGroq = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      await onTestGroq(groqApiKey, groqModel);
      setTestResult('Groq connection successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const handleTestOllama = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      await onTestOllama(ollamaBaseUrl, ollamaModel);
      setTestResult('Ollama connection successful!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider Settings</CardTitle>
        <CardDescription>Configure Groq or Ollama for test plan generation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Provider</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="groq"
                  checked={provider === 'groq'}
                  onChange={() => setProvider('groq')}
                />
                <span>Cloud LLM (Groq)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="provider"
                  value="ollama"
                  checked={provider === 'ollama'}
                  onChange={() => setProvider('ollama')}
                />
                <span>Local LLM (Ollama)</span>
              </label>
            </div>
          </div>

          {provider === 'groq' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="groq-key">API Key</Label>
                <Input
                  id="groq-key"
                  type="password"
                  placeholder="gsk_..."
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Get your API key from console.groq.com
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groq-model">Model</Label>
                <Select
                  id="groq-model"
                  options={GROQ_MODELS}
                  value={groqModel}
                  onChange={(e) => setGroqModel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Temperature: {groqTemperature}</Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={groqTemperature}
                  onValueChange={setGroqTemperature}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleTestGroq} disabled={testing || !groqApiKey}>
                {testing ? 'Testing...' : 'Test Groq Connection'}
              </Button>
            </>
          )}

          {provider === 'ollama' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Base URL</Label>
                <Input
                  id="ollama-url"
                  type="url"
                  placeholder="http://localhost:11434"
                  value={ollamaBaseUrl}
                  onChange={(e) => setOllamaBaseUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ollama-model">Model</Label>
                <Select
                  id="ollama-model"
                  options={ollamaModels.map(m => ({ value: m, label: m }))}
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleTestOllama} disabled={testing}>
                {testing ? 'Testing...' : 'Test Ollama Connection'}
              </Button>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {testResult && <p className="text-sm text-green-600">{testResult}</p>}
          
          <Button type="submit" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
