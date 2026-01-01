export interface TranslationResult {
  id: number;
  originalImage: string;
  translatedImage: string;
  originalFilename: string;
  fileSize: number;
  createdAt: string;
}

export interface TranslationRequest {
  image: string; // Base64 encoded
  filename: string;
}

export interface TranslationResponse {
  success: boolean;
  data?: TranslationResult;
  error?: string;
}

export interface HistoryResponse {
  success: boolean;
  data?: TranslationResult[];
  error?: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  current: string;
  results: TranslationResult[];
  errors: string[];
}
