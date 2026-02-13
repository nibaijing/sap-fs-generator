export type AIBackend = 'openai' | 'gemini';

export interface AIConfig {
  backend: AIBackend;
  model: string;
  apiKey?: string;
}

export const defaultAIConfig: AIConfig = {
  backend: 'openai',
  model: 'gpt-4o',
};
