import ExcelJS from 'exceljs';
import { FieldMapping } from '@/lib/excel/exporter';

export interface SAPTableInfo {
  tableName: string;
  description: string;
  fields: FieldMapping[];
}

export async function parseSE11Excel(buffer: ArrayBuffer): Promise<SAPTableInfo> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error('No worksheet found');

  const fields: FieldMapping[] = [];
  let tableName = '';
  const description = '';

  worksheet.eachRow((row, rowNum) => {
    if (rowNum === 1) {
      const cellValue = row.getCell(1).value?.toString() || '';
      if (cellValue.toLowerCase().includes('table') || cellValue.length > 0) {
        tableName = cellValue;
      }
      return;
    }

    const fieldName = row.getCell(1)?.value?.toString()?.trim();
    const dataType = row.getCell(2)?.value?.toString()?.trim();
    const length = row.getCell(3)?.value?.toString()?.trim();
    const descriptionCell = row.getCell(4)?.value?.toString()?.trim();

    if (fieldName && fieldName.length > 0 && !fieldName.startsWith('#')) {
      fields.push({
        fieldName,
        dataType: dataType || '',
        length: length || '',
        description: descriptionCell || '',
      });
    }
  });

  return { tableName, description, fields };
}
