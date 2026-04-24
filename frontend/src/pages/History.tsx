import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

interface HistoryEntry {
  id: string;
  ticket_id: string;
  test_plan_id: string;
  created_at: string;
  test_plan_content?: string;
}

export function History() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/testplan/history');
      const entries = await response.json();
      setHistory(entries);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-gray-500">View your previously generated test plans</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Test Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test plans generated yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPlan?.id === entry.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPlan(entry)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{entry.ticket_id}</span>
                        <span className="text-xs text-gray-500">{formatDate(entry.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {selectedPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPlan.ticket_id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                  {selectedPlan.test_plan_content || 'No content available'}
                </pre>
                <p className="text-xs text-gray-500 mt-4">
                  Generated: {formatDate(selectedPlan.created_at)}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Select a test plan from the history to view its content
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
