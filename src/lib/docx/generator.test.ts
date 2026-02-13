import { describe, it, expect } from 'vitest';
import { generateFSWordDoc } from '@/lib/docx/generator';

describe('Docx Generator', () => {
  it('should generate Word document with content', async () => {
    const data = {
      title: 'Test FS Document',
      overview: 'This is a test overview',
      businessBackground: 'Business context',
      functionalRequirements: 'Functional needs',
      processFlow: 'Process steps',
      interfaceRequirements: 'API interfaces',
      dataRequirements: 'Data model',
      errorHandling: 'Error cases',
      acceptanceCriteria: 'Acceptance tests',
    };

    const result = await generateFSWordDoc(data);
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should generate Word document with field mappings table', async () => {
    const data = {
      title: 'Test FS Document',
      overview: 'Overview',
      businessBackground: '',
      functionalRequirements: '',
      processFlow: '',
      interfaceRequirements: '',
      dataRequirements: '',
      errorHandling: '',
      acceptanceCriteria: '',
      fieldMappings: [
        { fieldName: 'FIELD1', dataType: 'CHAR', length: '10', description: 'Test field' },
      ],
    };

    const result = await generateFSWordDoc(data);
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle empty content', async () => {
    const data = {
      title: '',
      overview: '',
      businessBackground: '',
      functionalRequirements: '',
      processFlow: '',
      interfaceRequirements: '',
      dataRequirements: '',
      errorHandling: '',
      acceptanceCriteria: '',
    };

    const result = await generateFSWordDoc(data);
    
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
