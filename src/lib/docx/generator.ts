import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';

export interface FSDocumentData {
  title: string;
  overview: string;
  businessBackground: string;
  functionalRequirements: string;
  processFlow: string;
  interfaceRequirements: string;
  dataRequirements: string;
  errorHandling: string;
  acceptanceCriteria: string;
  fieldMappings?: { fieldName: string; dataType: string; length: string; description: string }[];
}

export async function generateFSWordDoc(data: FSDocumentData): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: data.title || '功能规格文档',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  const sections = [
    { title: '1. 文档概述', content: data.overview },
    { title: '2. 业务背景与目标', content: data.businessBackground },
    { title: '3. 功能需求描述', content: data.functionalRequirements },
    { title: '4. 业务流程', content: data.processFlow },
    { title: '5. 接口需求', content: data.interfaceRequirements },
    { title: '6. 数据要求', content: data.dataRequirements },
    { title: '7. 异常处理', content: data.errorHandling },
    { title: '8. 验收标准', content: data.acceptanceCriteria },
  ];

  for (const section of sections) {
    if (section.content) {
      children.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun(section.content)],
          spacing: { after: 200 },
        })
      );
    }
  }

  let tableRows: TableRow[] = [];
  
  if (data.fieldMappings && data.fieldMappings.length > 0) {
    children.push(
      new Paragraph({
        text: '9. 字段映射表',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 100 },
      })
    );

    tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ bold: true, text: '字段名' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ bold: true, text: '数据类型' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ bold: true, text: '长度' })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ bold: true, text: '描述' })] })] }),
        ],
      }),
      ...data.fieldMappings.map(
        (field) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(field.fieldName)] }),
              new TableCell({ children: [new Paragraph(field.dataType)] }),
              new TableCell({ children: [new Paragraph(field.length)] }),
              new TableCell({ children: [new Paragraph(field.description)] }),
            ],
          })
      ),
    ];
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...children,
          ...(tableRows.length > 0 ? [new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } })] : []),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
