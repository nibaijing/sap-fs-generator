import { AIConfig } from '@/lib/ai/config';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: 'docx' | 'xlsx';
  content: string | object;
  uploadedAt: number;
}

export interface ChatRequest {
  message: string;
  files?: UploadedFile[];
  history?: Message[];
  aiConfig?: AIConfig;
}
