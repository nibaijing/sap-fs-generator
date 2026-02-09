import { NextRequest, NextResponse } from 'next/server';
import { generateFSDocument } from '@/lib/openai';
import { parseFile } from '@/lib/file-parser';
import { ChatRequest, Message } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, files = [], history = [] } = body;

    // 解析已上传的文件
    let templateContent = '';
    if (files.length > 0) {
      for (const file of files) {
        templateContent += await parseFile(file);
      }
    }

    // 调用 AI 生成文档
    const content = await generateFSDocument(message, templateContent);

    // 构建回复
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
    };

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
