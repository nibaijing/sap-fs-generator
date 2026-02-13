import { spawn } from 'child_process';

async function callGeminiCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const gemini = spawn('gemini', ['--no-interactive', 'prompt', '--', prompt]);

    let output = '';
    let error = '';

    gemini.stdout.on('data', (data) => {
      output += data.toString();
    });

    gemini.stderr.on('data', (data) => {
      error += data.toString();
    });

    gemini.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Gemini CLI exited with code ${code}: ${error}`));
      } else {
        resolve(output.trim());
      }
    });
  });
}

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

  const fullPrompt = `${systemPrompt}

用户需求: ${userRequest}
${templateContent ? `参考模板内容: ${templateContent}` : ''}`;

  try {
    const result = await callGeminiCLI(fullPrompt);
    return result || '生成失败：Gemini CLI 返回空结果';
  } catch (error) {
    console.error('Gemini CLI Error:', error);
    
    // 如果 CLI 调用失败，返回 Mock 数据
    return `[MOCK FS DOCUMENT - CLI 调用失败]
错误信息: ${error instanceof Error ? error.message : String(error)}

用户需求: ${userRequest.substring(0, 50)}...

请检查：
1. 是否已安装 gemini-cli: npm install -g @google/gemini-cli
2. 是否已登录: gemini login
3. CLI 是否能正常使用: gemini "你好"

这是备用 Mock 输出：
1. 文档概述: 关于 ${userRequest.substring(0, 20)}...
2. 业务背景: 用户请求生成 SAP 功能
3. 状态: Mock 模式（请配置 CLI）`;
  }
}
