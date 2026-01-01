import { Database } from 'bun:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import type { TranslationResult } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/history.db');
const db = new Database(dbPath, { create: true });

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS translation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_image TEXT NOT NULL,
    translated_image TEXT NOT NULL,
    original_filename TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_created_at ON translation_history(created_at DESC);
`);

export function saveTranslation(
  originalImage: string,
  translatedImage: string,
  originalFilename: string,
  fileSize: number
): TranslationResult {
  const stmt = db.prepare(`
    INSERT INTO translation_history (original_image, translated_image, original_filename, file_size)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(originalImage, translatedImage, originalFilename, fileSize);

  return getTranslationById(Number(result.lastInsertRowid))!;
}

export function getTranslationById(id: number): TranslationResult | undefined {
  const stmt = db.prepare(`
    SELECT id, original_image, translated_image, original_filename, file_size, created_at
    FROM translation_history
    WHERE id = ?
  `);

  return stmt.get(id) as TranslationResult | undefined;
}

export function getAllTranslations(limit = 50, offset = 0): TranslationResult[] {
  const stmt = db.prepare(`
    SELECT id, original_image, translated_image, original_filename, file_size, created_at
    FROM translation_history
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(limit, offset) as TranslationResult[];
}

export function deleteTranslation(id: number): boolean {
  const stmt = db.prepare(`DELETE FROM translation_history WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

export function clearAllTranslations(): number {
  const stmt = db.prepare(`DELETE FROM translation_history`);
  const result = stmt.run();
  return result.changes;
}

export default db;
