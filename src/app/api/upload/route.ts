import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileId = uuidv4();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type = ext === 'docx' ? 'docx' : ext === 'xlsx' || ext === 'xls' ? 'xlsx' : 'other';

    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, `${fileId}.${ext}`), buffer);

    return NextResponse.json({
      file: {
        id: fileId,
        name: file.name,
        type,
        content: buffer.toString('base64'),
        uploadedAt: Date.now(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
