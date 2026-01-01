import type { GeminiResponse } from '../types/index.js';

// Gemini 3 Pro Image Preview (Nano Banana Pro) - 이미지 생성/편집 지원
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

const TRANSLATION_PROMPT = `You are a professional image text translator. Your task is to translate all text in this image to Korean.

INSTRUCTIONS:
1. Identify ALL text in the image (speech bubbles, captions, sound effects, signs, etc.)
2. Translate the text to natural Korean
3. Generate a NEW image that is identical to the original, but with Korean text replacing the original text
4. Maintain the exact same:
   - Image composition and layout
   - Font style, size, and color (as close as possible)
   - Text positions within speech bubbles/panels
   - All visual elements except the text language

IMPORTANT: This is a TEXT TRANSLATION task. You are replacing text, not creating new imagery.
The visual content must remain EXACTLY as provided - only the text language changes.

Please output the translated image now.`;

export async function translateImage(
  base64Image: string,
  mimeType: string = 'image/png'
): Promise<{ success: boolean; image?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'GEMINI_API_KEY is not configured' };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: TRANSLATION_PROMPT },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
        ]
      })
    });

    const data: GeminiResponse = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts) {
      return { success: false, error: 'No response from Gemini API' };
    }

    // Find the image part (check both inline_data and inlineData)
    const imagePart = parts.find(part => part.inline_data || part.inlineData);
    const imageData = imagePart?.inline_data || imagePart?.inlineData;

    if (!imageData) {
      // If no image returned, maybe there was no text to translate
      const textPart = parts.find(part => part.text);
      return {
        success: false,
        error: textPart?.text || 'No translated image returned'
      };
    }

    return {
      success: true,
      image: imageData.data
    };

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: message };
  }
}
