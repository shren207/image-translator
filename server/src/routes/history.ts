import { Router, Request, Response } from 'express';
import {
  getAllTranslations,
  getTranslationById,
  deleteTranslation,
  clearAllTranslations
} from '../services/database.js';

const router = Router();

// Get all translation history
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const translations = getAllTranslations(limit, offset);

    const data = translations.map(t => ({
      id: t.id,
      originalImage: t.original_image,
      translatedImage: t.translated_image,
      originalFilename: t.original_filename,
      fileSize: t.file_size,
      createdAt: t.created_at
    }));

    res.json({ success: true, data });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch history';
    res.status(500).json({ success: false, error: message });
  }
});

// Get single translation by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid ID' });
      return;
    }

    const translation = getTranslationById(id);

    if (!translation) {
      res.status(404).json({ success: false, error: 'Translation not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: translation.id,
        originalImage: translation.original_image,
        translatedImage: translation.translated_image,
        originalFilename: translation.original_filename,
        fileSize: translation.file_size,
        createdAt: translation.created_at
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch translation';
    res.status(500).json({ success: false, error: message });
  }
});

// Delete single translation
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid ID' });
      return;
    }

    const deleted = deleteTranslation(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Translation not found' });
      return;
    }

    res.json({ success: true, message: 'Translation deleted' });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete translation';
    res.status(500).json({ success: false, error: message });
  }
});

// Clear all history
router.delete('/', (req: Request, res: Response) => {
  try {
    const count = clearAllTranslations();
    res.json({ success: true, message: `Deleted ${count} translations` });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to clear history';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
