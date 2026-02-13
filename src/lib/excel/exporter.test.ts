import { describe, it, expect } from 'vitest';
import { generateExcelExport } from '@/lib/excel/exporter';

describe('Excel Exporter', () => {
  it('should generate Excel buffer with field mappings', async () => {
    const fields = [
      { fieldName: 'MANDT', dataType: 'CHAR', length: '3', description: 'Client' },
      { fieldName: 'BUKRS', dataType: 'CHAR', length: '4', description: 'Company Code' },
    ];

    const result = await generateExcelExport(fields);
    
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });

  it('should handle empty fields array', async () => {
    const fields: { fieldName: string; dataType: string; length: string; description: string }[] = [];
    
    const result = await generateExcelExport(fields);
    
    expect(result).toBeDefined();
    expect(result.byteLength).toBeGreaterThan(0);
  });
});
