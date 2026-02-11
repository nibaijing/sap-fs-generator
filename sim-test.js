const { generateFSDocument } = require('./src/lib/openai');
const { parseFile } = require('./src/lib/file-parser');

async function test() {
  console.log('--- Testing Mock AI ---');
  const mockRequest = '创建一个物料主数据查询报表';
  const aiResult = await generateFSDocument(mockRequest);
  console.log('AI Result:', aiResult);

  console.log('\n--- Testing Mock Parser ---');
  const mockFile = {
    id: '1',
    name: 'template.docx',
    type: 'docx',
    content: 'SGVsbG8gV29ybGQ=', // Base64 for "Hello World"
    uploadedAt: Date.now()
  };
  const parseResult = await parseFile(mockFile);
  console.log('Parse Result:', parseResult);
}

test();
