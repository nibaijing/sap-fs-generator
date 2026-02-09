import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateFSDocument(
  userRequest: string,
  templateContent?: string
): Promise<string> {
  const systemPrompt = `你是SAP FS（功能规格）文档生成专家。

根据用户需求，生成专业的功能规格文档。文档需要包含：
1. 文档概述
2. 业务背景与目标
3. 功能需求描述
4. 业务流程图（用文字描述）
5. 接口需求
6. 数据要求
7. 异常处理
8. 验收标准

如果用户上传了模板，请参考模板格式。

请用中文回复。`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userRequest },
      ...(templateContent ? [{ role: 'user', content: `参考模板内容：${templateContent}` }] : []),
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '生成失败';
}
