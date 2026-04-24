import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { JiraTicketDisplay } from '../components/jira-display/JiraTicketDisplay';
import { useJira } from '../hooks/useJira';
import { useLLM } from '../hooks/useLLM';
import { useTemplates } from '../hooks/useTemplates';
import { useTestPlan } from '../hooks/useTestPlan';

export function Dashboard() {
  const [ticketId, setTicketId] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'groq' | 'ollama'>('groq');
  
  const { ticket, recentTickets, loading, error, fetchTicket, loadRecentTickets } = useJira();
  const { config: llmConfig, loadConfig: loadLLMConfig } = useLLM();
  const { activeTemplate, loadTemplates } = useTemplates();
  const { testPlan, generating, progress, generateTestPlan, clearTestPlan } = useTestPlan();

  useEffect(() => {
    loadRecentTickets();
    loadLLMConfig();
    loadTemplates();
  }, [loadRecentTickets, loadLLMConfig, loadTemplates]);

  useEffect(() => {
    if (llmConfig) {
      setSelectedProvider(llmConfig.provider);
    }
  }, [llmConfig]);

  const handleFetchTicket = async () => {
    if (!ticketId.trim()) return;
    const id = ticketId.trim().toUpperCase();
    if (!/^[A-Z]+-\d+$/.test(id)) {
      alert('Invalid JIRA ID format. Use format like VWO-123');
      return;
    }
    await fetchTicket(id);
  };

  const handleGenerate = async () => {
    if (!ticket || !activeTemplate) return;
    await generateTestPlan(ticket.ticketId, activeTemplate.id, selectedProvider);
  };

  const handleCopyToClipboard = () => {
    if (testPlan?.content) {
      navigator.clipboard.writeText(testPlan.content).catch((err) => {
        console.error('Clipboard error:', err);
        alert('Failed to copy to clipboard. Please copy manually.');
      });
    }
  };

  const handleExport = () => {
    if (!testPlan?.content) return;
    const blob = new Blob([testPlan.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testplan-${ticket?.ticketId || 'export'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Plan Generator</h1>
          <p className="text-gray-500">Generate AI-powered test plans from JIRA tickets</p>
        </div>
        <Badge variant={selectedProvider === 'groq' ? 'default' : 'secondary'}>
          Provider: {selectedProvider === 'groq' ? 'Groq (Cloud)' : 'Ollama (Local)'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Enter JIRA Ticket</CardTitle>
              <CardDescription>Enter a JIRA ticket ID to fetch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., VWO-123"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchTicket()}
                />
                <Button onClick={handleFetchTicket} disabled={generating}>
                  Fetch Ticket
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}
              
              {loading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                  Fetching ticket...
                </div>
              )}
              
              {recentTickets.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Recent tickets:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentTickets.slice(0, 5).map((t) => (
                      <Badge
                        key={t.ticketId}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setTicketId(t.ticketId);
                          fetchTicket(t.ticketId);
                        }}
                      >
                        {t.ticketId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {ticket && <JiraTicketDisplay ticket={ticket} />}

          {ticket && activeTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Generate Test Plan</CardTitle>
                <CardDescription>
                  Using template: {activeTemplate.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="provider"
                      value="groq"
                      checked={selectedProvider === 'groq'}
                      onChange={() => setSelectedProvider('groq')}
                    />
                    <span>Groq (Cloud)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="provider"
                      value="ollama"
                      checked={selectedProvider === 'ollama'}
                      onChange={() => setSelectedProvider('ollama')}
                    />
                    <span>Ollama (Local)</span>
                  </label>
                </div>

                {generating && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600">{progress}</span>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !activeTemplate}
                  className="w-full"
                >
                  {generating ? 'Generating...' : 'Generate Test Plan'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Generated Test Plan</CardTitle>
              <CardDescription>View and export your generated test plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testPlan ? (
                <>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                      Copy to Clipboard
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                      Export Markdown
                    </Button>
                    <Button variant="ghost" onClick={clearTestPlan}>
                      Clear
                    </Button>
                  </div>
                  <Textarea
                    value={testPlan.content}
                    onChange={() => {}}
                    className="min-h-[500px] font-mono text-sm"
                    readOnly
                  />
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No test plan generated yet.</p>
                  <p className="text-sm">Enter a JIRA ticket and click Generate to create one.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
