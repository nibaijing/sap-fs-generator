/* eslint-disable @typescript-eslint/no-explicit-any */
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import { UploadedFile } from '@/types';

export async function parseFile(file: UploadedFile): Promise<string | object> {
  try {
    const buffer = Buffer.from(file.content as string, 'base64');
    
    if (file.type === 'docx') {
      const result = await mammoth.extractRawText({ buffer: buffer as any });
      return result.value;
    } else if (file.type === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as any);
      const data: Record<string, any>[] = [];

      workbook.eachSheet((worksheet) => {
        const sheetData: Record<string, any> = { name: worksheet.name, rows: [] };
        worksheet.eachRow((row) => {
          sheetData.rows.push(row.values);
        });
        data.push(sheetData);
      });

      return data;
    }
  } catch {
    return `[MOCK PARSED CONTENT for ${file.name}] 这是模拟的文件解析内容。`;
  }
  return '';
}
