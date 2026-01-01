export interface TranslationResult {
  id: number;
  original_image: string;
  translated_image: string;
  original_filename: string;
  file_size: number;
  created_at: string;
}

export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        // snake_case (REST API response)
        inline_data?: {
          mime_type: string;
          data: string;
        };
        // camelCase (also possible in response)
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}
