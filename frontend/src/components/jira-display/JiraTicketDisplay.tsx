import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { JiraTicket } from '../../services/api';

interface JiraTicketDisplayProps {
  ticket: JiraTicket;
}

const priorityColors: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  Highest: 'destructive',
  High: 'warning',
  Medium: 'default',
  Low: 'secondary',
  Lowest: 'secondary',
};

export function JiraTicketDisplay({ ticket }: JiraTicketDisplayProps) {
  const formatDescription = (desc: any): string => {
    if (!desc) return '';
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc.content) {
      return extractTextFromAdf(desc);
    }
    return JSON.stringify(desc);
  };

  const extractTextFromAdf = (adf: any): string => {
    if (!adf || !adf.content) return '';
    const texts: string[] = [];
    const processNode = (node: any) => {
      if (node.type === 'text' && node.text) {
        texts.push(node.text);
      }
      if (node.content) {
        node.content.forEach(processNode);
      }
    };
    adf.content.forEach(processNode);
    return texts.join('\n');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{ticket.ticketId}</span>
          <div className="flex gap-2">
            <Badge variant={priorityColors[ticket.priority] || 'default'}>
              {ticket.priority}
            </Badge>
            <Badge variant="secondary">{ticket.status}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{ticket.summary || 'No summary'}</h3>
        </div>

        {ticket.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {formatDescription(ticket.description)}
            </p>
          </div>
        )}

        {ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Acceptance Criteria</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {ticket.acceptanceCriteria.map((criteria, idx) => (
                <li key={idx}>{String(criteria)}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-4 text-sm">
          {ticket.assignee && (
            <div>
              <span className="font-medium text-gray-700">Assignee: </span>
              <span className="text-gray-600">{String(ticket.assignee)}</span>
            </div>
          )}
        </div>

        {ticket.labels && ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.labels.map((label, idx) => (
              <Badge key={`label-${idx}`} variant="outline">
                {String(label)}
              </Badge>
            ))}
          </div>
        )}

        {ticket.attachments && ticket.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Attachments</h4>
            <ul className="text-sm space-y-1">
              {ticket.attachments.map((attachment, idx) => (
                <li key={`attach-${idx}`}>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {attachment.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
