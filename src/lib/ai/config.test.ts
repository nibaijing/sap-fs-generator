import { describe, it, expect } from 'vitest';
import { defaultAIConfig, AIConfig } from '@/lib/ai/config';

describe('AI Config', () => {
  it('should have default config', () => {
    expect(defaultAIConfig).toBeDefined();
    expect(defaultAIConfig.backend).toBe('openai');
    expect(defaultAIConfig.model).toBe('gpt-4o');
  });

  it('should accept custom config', () => {
    const customConfig: AIConfig = {
      backend: 'gemini',
      model: 'gemini-pro',
      apiKey: 'test-key',
    };

    expect(customConfig.backend).toBe('gemini');
    expect(customConfig.model).toBe('gemini-pro');
    expect(customConfig.apiKey).toBe('test-key');
  });

  it('should allow optional apiKey', () => {
    const configWithoutKey: AIConfig = {
      backend: 'openai',
      model: 'gpt-4o',
    };

    expect(configWithoutKey.apiKey).toBeUndefined();
  });
});
