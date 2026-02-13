import ExcelJS from 'exceljs';

export interface FieldMapping {
  fieldName: string;
  dataType: string;
  length: string;
  description: string;
}

export async function generateExcelExport(fields: FieldMapping[]): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('字段映射');

  worksheet.columns = [
    { header: '字段名', key: 'fieldName', width: 20 },
    { header: '数据类型', key: 'dataType', width: 15 },
    { header: '长度', key: 'length', width: 10 },
    { header: '描述', key: 'description', width: 40 },
  ];

  for (const field of fields) {
    worksheet.addRow(field);
  }

  return await workbook.xlsx.writeBuffer();
}
