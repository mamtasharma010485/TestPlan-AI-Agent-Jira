import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../data/app.db');

let db;

export function getDb() {
  if (!db) {
    db = new sqlite3.Database(dbPath);
  }
  return db;
}

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS jira_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        base_url TEXT,
        username TEXT,
        api_token_encrypted TEXT,
        connected INTEGER DEFAULT 0,
        last_verified TEXT
      )`);

db.run(`CREATE TABLE IF NOT EXISTS llm_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        provider TEXT DEFAULT 'ollama',
        groq_api_key_encrypted TEXT,
        groq_model TEXT DEFAULT 'openai/gpt-oss-120b',
        groq_temperature REAL DEFAULT 0.7,
        openai_api_key_encrypted TEXT,
        openai_model TEXT DEFAULT 'gpt-4o-mini',
        openai_temperature REAL DEFAULT 0.7,
        ollama_base_url TEXT DEFAULT 'http://localhost:11434',
        ollama_model TEXT DEFAULT 'llama3'
      )`);

      db.run(`INSERT OR IGNORE INTO llm_config (id, provider, groq_model) VALUES (1, 'ollama', 'openai/gpt-oss-120b')`);
      
      resolve();
    });
  });
}

export function getSetting(key) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : null);
    });
  });
}

export function setSetting(key, value) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)', 
      [key, value, new Date().toISOString()], 
      (err) => err ? reject(err) : resolve()
    );
  });
}
