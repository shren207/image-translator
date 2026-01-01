import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import translateRouter from './routes/translate.js';
import historyRouter from './routes/history.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/translate', translateRouter);
app.use('/api/history', historyRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  POST /api/translate - Translate single image`);
  console.log(`  POST /api/translate/batch - Translate multiple images`);
  console.log(`  GET  /api/history - Get translation history`);
  console.log(`  GET  /api/history/:id - Get single translation`);
  console.log(`  DELETE /api/history/:id - Delete translation`);
  console.log(`  DELETE /api/history - Clear all history`);
});
