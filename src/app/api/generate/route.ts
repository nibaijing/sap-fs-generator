import { NextRequest, NextResponse } from 'next/server';
import { generateFSWordDoc } from '@/lib/docx/generator';
import { generateExcelExport } from '@/lib/excel/exporter';
import { FSDocumentData } from '@/lib/docx/generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, content, fieldMappings } = body;

    if (format === 'docx') {
      const parsedContent: FSDocumentData = typeof content === 'string' 
        ? JSON.parse(content) 
        : content;
      
      const docBuffer = await generateFSWordDoc(parsedContent);
      return new NextResponse(new Uint8Array(docBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="FS-Document.docx"',
        },
      });
    } else if (format === 'xlsx' && fieldMappings) {
      const excelBuffer = await generateExcelExport(fieldMappings);
      return new NextResponse(new Uint8Array(excelBuffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="Field-Mappings.xlsx"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
