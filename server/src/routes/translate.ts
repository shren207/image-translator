import { Router, Request, Response } from 'express';
import { translateImage } from '../services/gemini.js';
import { saveTranslation } from '../services/database.js';

const router = Router();

interface TranslateBody {
  image: string; // Base64 encoded image
  filename: string;
  mimeType?: string;
}

interface BatchTranslateBody {
  images: Array<{
    image: string;
    filename: string;
    mimeType?: string;
  }>;
}

// Single image translation
router.post('/', async (req: Request<object, object, TranslateBody>, res: Response) => {
  try {
    const { image, filename, mimeType = 'image/png' } = req.body;

    if (!image) {
      res.status(400).json({ success: false, error: 'Image is required' });
      return;
    }

    // Calculate approximate file size from base64
    const fileSize = Math.ceil((image.length * 3) / 4);

    const result = await translateImage(image, mimeType);

    if (!result.success || !result.image) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    // Save to database
    const saved = saveTranslation(
      image,
      result.image,
      filename || 'untitled',
      fileSize
    );

    res.json({
      success: true,
      data: {
        id: saved.id,
        originalImage: saved.original_image,
        translatedImage: saved.translated_image,
        originalFilename: saved.original_filename,
        fileSize: saved.file_size,
        createdAt: saved.created_at
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Translation failed';
    res.status(500).json({ success: false, error: message });
  }
});

// Batch translation
router.post('/batch', async (req: Request<object, object, BatchTranslateBody>, res: Response) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      res.status(400).json({ success: false, error: 'Images array is required' });
      return;
    }

    const results = [];
    const errors = [];

    for (const item of images) {
      try {
        const { image, filename, mimeType = 'image/png' } = item;
        const fileSize = Math.ceil((image.length * 3) / 4);

        const result = await translateImage(image, mimeType);

        if (result.success && result.image) {
          const saved = saveTranslation(
            image,
            result.image,
            filename || 'untitled',
            fileSize
          );

          results.push({
            id: saved.id,
            originalImage: saved.original_image,
            translatedImage: saved.translated_image,
            originalFilename: saved.original_filename,
            fileSize: saved.file_size,
            createdAt: saved.created_at
          });
        } else {
          errors.push(`${filename}: ${result.error}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`${item.filename}: ${message}`);
      }
    }

    res.json({
      success: true,
      data: {
        total: images.length,
        completed: results.length,
        results,
        errors
      }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Batch translation failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
