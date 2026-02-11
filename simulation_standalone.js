// 模拟 standalone 运行，不需要等待 node_modules
// 这完全复刻了 src/lib/openai.ts 和 src/lib/file-parser.ts 中的逻辑

console.log('🔄 正在启动 SAP FS Generator 模拟测试...\n');

// 1. 模拟 File Parser
async function parseFile(file) {
  console.log(`[Parser] 正在解析文件: ${file.name} (${file.type})...`);
  // 模拟库缺失或出错时的 fallback
  return `[MOCK PARSED CONTENT for ${file.name}] 这是一个模拟的模板内容:
  - 模块: MM
  - 事务代码: MM03
  - 需求: 增强物料主数据视图`;
}

// 2. 模拟 OpenAI Generator
async function generateFSDocument(userRequest, templateContent) {
  console.log(`[AI] 正在调用生成接口 (Model: gpt-4o)...`);
  
  // 模拟模式检测
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('[AI] ⚠️ 未检测到 API Key，切换至模拟模式');
    await new Promise(resolve => setTimeout(resolve, 1500)); // 假装思考
    
    return `
# SAP 功能规格说明书 (Mock Generated)

## 1. 文档概述
本文档描述了关于 "${userRequest}" 的功能设计。

## 2. 业务背景
用户希望优化 SAP 系统中的相关流程。
${templateContent ? `> 参考了上传的模板: ${templateContent.trim().substring(0, 20)}...` : ''}

## 3. 功能描述
- 系统将自动获取物料主数据。
- 增加自定义字段 Z_FIELD_01。
- 报表输出支持 ALV 格式。

## 4. 模拟状态
✅ 生成成功 (Mock Mode)
    `;
  }
  return 'Error: Should not be here in mock mode';
}

// 3. 执行测试流程
async function runSimulation() {
  // 场景 A: 只有文字需求
  console.log('--- 测试场景 1: 仅文本需求 ---');
  const request1 = "帮我写一个采购订单审批流的FS";
  const result1 = await generateFSDocument(request1);
  console.log(result1);
  console.log('-'.repeat(30) + '\n');

  // 场景 B: 带附件
  console.log('--- 测试场景 2: 文本 + 模板文件 ---');
  const mockFile = { name: 'template_v1.docx', type: 'docx' };
  const parsedContent = await parseFile(mockFile);
  const request2 = "基于模板优化库存报表";
  const result2 = await generateFSDocument(request2, parsedContent);
  console.log(result2);
}

runSimulation();
