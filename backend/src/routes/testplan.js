import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateTestPlan, getLLMConfigPublic } from '../services/llm-providers.js';
import { fetchTicket, initJiraClient } from '../services/jira-client.js';
import { getDb } from '../services/database.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { ticketId, templateId, provider } = req.body;
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }
    
    await initJiraClient();
    const ticket = await fetchTicket(ticketId);
    
    const db = getDb();
    let template = { content: '' };
    
    if (templateId) {
      template = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM templates WHERE id = ?', [templateId], (err, row) => {
          if (err) reject(err);
          else resolve(row || { content: '' });
        });
      });
    }
    
    const llmConfig = await getLLMConfigPublic();
    const activeProvider = provider || llmConfig.provider;
    
    const prompt = buildPrompt(ticket, template.content);
    
    const content = await generateTestPlan(activeProvider, prompt, {
      model: activeProvider === 'groq' ? llmConfig.groq_model : llmConfig.ollama_model,
      temperature: llmConfig.groq_temperature
    });
    
    const testPlanId = uuidv4();
    const testPlan = {
      id: testPlanId,
      ticketId,
      templateId: templateId || null,
      content,
      generatedAt: new Date().toISOString(),
      provider: activeProvider
    };
    
    db.run(
      'INSERT INTO test_plans (id, ticket_id, template_id, content, generated_at, provider) VALUES (?, ?, ?, ?, ?, ?)',
      [testPlan.id, testPlan.ticketId, testPlan.templateId, testPlan.content, testPlan.generatedAt, testPlan.provider],
      (err) => {
        if (err) console.error('Failed to save test plan:', err);
      }
    );
    
    const historyId = uuidv4();
    db.run(
      'INSERT INTO history (id, ticket_id, test_plan_id, created_at) VALUES (?, ?, ?, ?)',
      [historyId, ticketId, testPlanId, new Date().toISOString()],
      (err) => {
        if (err) console.error('Failed to save history:', err);
      }
    );
    
    res.json(testPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function buildPrompt(ticket, templateContent) {
  const templateSection = templateContent 
    ? `\n\nTEMPLATE STRUCTURE:\n${templateContent.substring(0, 2000)}` 
    : '\n\nUse a standard test plan structure including: Overview, Test Scope, Test Environment, Test Scenarios, Test Cases, and Acceptance Criteria.';
  
  return `
JIRA TICKET INFORMATION:
- Key: ${ticket.ticketId}
- Summary: ${ticket.summary}
- Description: ${ticket.description}
- Priority: ${ticket.priority}
- Status: ${ticket.status}
- Assignee: ${ticket.assignee}
- Labels: ${ticket.labels.join(', ') || 'None'}
- Acceptance Criteria: ${ticket.acceptanceCriteria?.join('\n') || 'None'}
${templateSection}

Please generate a comprehensive test plan based on the above JIRA ticket information.
  `.trim();
}

router.get('/history', (req, res) => {
  try {
    const db = getDb();
    db.all(
      'SELECT h.*, t.content as test_plan_content FROM history h LEFT JOIN test_plans t ON h.test_plan_id = t.id ORDER BY h.created_at DESC LIMIT 20',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json(rows || []);
        }
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    db.get('SELECT * FROM test_plans WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!row) {
        res.status(404).json({ error: 'Test plan not found' });
      } else {
        res.json(row);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;