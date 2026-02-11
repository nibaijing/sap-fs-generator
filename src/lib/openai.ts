import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateFSDocument(
  userRequest: string,
  templateContent?: string
): Promise<string> {
  // 模拟模式
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === '') {
    return `[MOCK FS DOCUMENT]
1. 文档概述: 关于 ${userRequest.substring(0, 20)}... 的功能规格说明。
2. 业务背景: 用户请求生成基于 "${userRequest}" 的 SAP 功能。
3. 功能描述: 这是一个模拟生成的功能文档。
4. 参考模板: ${templateContent ? '已参考上传的模板内容' : '未提供模板'}
5. 状态: 模拟成功。`;
  }

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
