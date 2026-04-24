import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../services/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../templates');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const router = Router();

router.post('/test', upload.single('file'), (req, res) => {
  console.log('TEST UPLOAD: req.file:', req.file);
  res.json({ received: !!req.file, file: req.file?.originalname });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  console.log('=== TEMPLATE UPLOAD ===');
  console.log('req.method:', req.method);
  console.log('req.headers:', req.headers['content-type']);
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);
  
  try {
    if (!req.file) {
      console.error('No file in request - multer failed');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('Processing file:', req.file.originalname, req.file.size, 'bytes');
    
    let content = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      content = data.text;
      console.log('PDF parsed, content length:', content.length);
    } catch (pdfErr) {
      console.error('PDF parse error:', pdfErr.message);
      content = 'Default test plan template';
    }
    
    const structure = extractStructure(content);
    
    const template = {
      id: uuidv4(),
      name: req.file.originalname,
      content,
      structure: JSON.stringify(structure),
      isDefault: 0,
      uploadedAt: new Date().toISOString()
    };
    
    console.log('Saving template to database');
    
    const db = getDb();
    db.run(
      'INSERT INTO templates (id, name, content, structure, is_default, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)',
      [template.id, template.name, template.content, template.structure, template.isDefault, template.uploadedAt],
      (err) => {
        if (err) {
          console.error('Database error:', err);
          res.status(500).json({ error: 'Failed to save template: ' + err.message });
        } else {
          console.log('Template saved successfully');
          res.json(template);
        }
      }
    );
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

function extractStructure(text) {
  const lines = text.split('\n');
  const structure = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^(#{1,3}\s|\d+\.|[A-Z]\.|\([a-z]\))\s*.+/)) {
      structure.push(trimmed.replace(/^#{1,3}\s*|\d+\.|[A-Z]\.|\([a-z]\)\s*/g, ''));
    }
  }
  
  if (structure.length === 0) {
    return ['Test Plan Overview', 'Test Scope', 'Test Environment', 'Test Scenarios', 'Test Cases', 'Acceptance Criteria'];
  }
  
  return structure;
}

router.get('/', (req, res) => {
  try {
    const db = getDb();
    db.all('SELECT * FROM templates ORDER BY uploaded_at DESC', [], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows || []);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    db.get('SELECT * FROM templates WHERE id = ?', [req.params.id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (!row) {
        res.status(404).json({ error: 'Template not found' });
      } else {
        res.json(row);
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM templates WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ success: true });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;