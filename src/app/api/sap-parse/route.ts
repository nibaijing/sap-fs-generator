import { NextRequest, NextResponse } from 'next/server';
import { parseSE11Excel } from '@/lib/parser/se11-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const result = await parseSE11Excel(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('SAP parse error:', error);
    return NextResponse.json({ error: '解析失败' }, { status: 500 });
  }
}
