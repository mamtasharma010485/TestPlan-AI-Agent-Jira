import { Router } from 'express';
import { fetchTicket, initJiraClient } from '../services/jira-client.js';
import { validateJiraId, sanitizeTicketId } from '../utils/validators.js';
import { getDb } from '../services/database.js';

const router = Router();

router.post('/fetch', async (req, res) => {
  try {
    const { ticketId } = req.body;
    console.log('Fetching JIRA ticket:', ticketId);
    
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }
    
    const sanitizedId = sanitizeTicketId(ticketId);
    console.log('Sanitized ID:', sanitizedId);
    
    if (!validateJiraId(sanitizedId)) {
      return res.status(400).json({ error: 'Invalid ticket ID format. Use format: PROJECT-123' });
    }
    
    console.log('Initializing JIRA client...');
    await initJiraClient();
    console.log('Fetching ticket from JIRA...');
    const ticket = await fetchTicket(sanitizedId);
    console.log('Ticket fetched successfully');
    
    const db = getDb();
    db.run(
      'INSERT OR REPLACE INTO recent_tickets (ticket_id, fetched_at) VALUES (?, ?)',
      [sanitizedId, new Date().toISOString()],
      (err) => {
        if (err) console.error('Failed to save recent ticket:', err);
      }
    );
    
    res.json(ticket);
  } catch (err) {
    console.error('JIRA fetch error:', err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const db = getDb();
    db.all(
      'SELECT * FROM recent_tickets ORDER BY fetched_at DESC LIMIT 5',
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

export default router;