import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface JiraConfigFormProps {
  config: { baseUrl: string; username: string; connected: boolean } | null;
  onSave: (baseUrl: string, username: string, apiToken: string) => Promise<void>;
  onConfigChange?: (config: { baseUrl: string; username: string; connected: boolean }) => void;
  loading?: boolean;
}

export function JiraConfigForm({ config, onSave, onConfigChange, loading }: JiraConfigFormProps) {
  const [baseUrl, setBaseUrl] = useState('');
  const [username, setUsername] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (config) {
      setBaseUrl(config.baseUrl || '');
      setUsername(config.username || '');
      setConnected(config.connected || false);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(baseUrl, username, apiToken);
      setConnected(true);
      onConfigChange?.({ baseUrl, username, connected: true });
      setApiToken('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          JIRA Configuration
          {connected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="destructive">Not Connected</Badge>
          )}
        </CardTitle>
        <CardDescription>Configure your JIRA connection settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jira-url">JIRA Base URL</Label>
            <Input
              id="jira-url"
              type="url"
              placeholder="https://company.atlassian.net"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-email">Username / Email</Label>
            <Input
              id="jira-email"
              type="email"
              placeholder="user@company.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-token">API Token</Label>
            <Input
              id="jira-token"
              type="password"
              placeholder="Enter your JIRA API token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your API token from id.atlassian.com/manage-profile/security/api-tokens
            </p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
