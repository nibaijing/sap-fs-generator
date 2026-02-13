import OpenAI from 'openai';
import { spawn } from 'child_process';
import { AIConfig } from './config';

export async function generateWithAI(
  prompt: string,
  config: AIConfig,
  templateContent?: string
): Promise<string> {
  if (config.backend === 'openai') {
    return generateWithOpenAI(prompt, config);
  } else {
    return generateWithGemini(prompt, templateContent);
  }
}

async function generateWithOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const client = new OpenAI({
    apiKey: config.apiKey || process.env.OPENAI_API_KEY,
  });

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
请用中文回复，格式化为JSON对象，包含以下字段：
{
  "title": "文档标题",
  "overview": "文档概述",
  "businessBackground": "业务背景与目标",
  "functionalRequirements": "功能需求描述",
  "processFlow": "业务流程",
  "interfaceRequirements": "接口需求",
  "dataRequirements": "数据要求",
  "errorHandling": "异常处理",
  "acceptanceCriteria": "验收标准"
}`;

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch {
        return content;
      }
    }
    
    return content || '生成失败';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return JSON.stringify({
      title: '功能规格文档',
      overview: 'AI生成失败，请检查API配置',
      businessBackground: '',
      functionalRequirements: '',
      processFlow: '',
      interfaceRequirements: '',
      dataRequirements: '',
      errorHandling: '',
      acceptanceCriteria: ''
    });
  }
}

async function generateWithGemini(prompt: string, _templateContent?: string): Promise<string> {
  return new Promise((resolve) => {
    const fullPrompt = `你是SAP FS文档生成专家。请根据以下需求生成功能规格文档，以JSON格式返回：${prompt}`;
    const gemini = spawn('gemini', ['--no-interactive', 'prompt', '--', fullPrompt]);
    
    let output = '';
    gemini.stdout.on('data', (data) => { output += data.toString(); });
    gemini.on('close', (code) => {
      if (code !== 0) {
        resolve(JSON.stringify({
          title: '功能规格文档',
          overview: 'Gemini CLI不可用，请配置OpenAI API',
          businessBackground: '',
          functionalRequirements: '',
          processFlow: '',
          interfaceRequirements: '',
          dataRequirements: '',
          errorHandling: '',
          acceptanceCriteria: ''
        }));
      } else {
        resolve(output.trim());
      }
    });
    gemini.on('error', () => {
      resolve(JSON.stringify({
        title: '功能规格文档',
        overview: 'Gemini CLI不可用',
        businessBackground: '',
        functionalRequirements: '',
        processFlow: '',
        interfaceRequirements: '',
        dataRequirements: '',
        errorHandling: '',
        acceptanceCriteria: ''
      }));
    });
  });
}
