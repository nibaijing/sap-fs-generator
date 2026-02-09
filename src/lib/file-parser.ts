import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import { UploadedFile } from '@/types';

export async function parseFile(file: UploadedFile): Promise<string | object> {
  if (file.type === 'docx') {
    // 解析 DOCX
    const result = await mammoth.extractRawText({ buffer: Buffer.from(file.content as string, 'base64') });
    return result.value;
  } else if (file.type === 'xlsx') {
    // 解析 Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(file.content as string, 'base64'));
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
  return '';
}
