# SAP FS Generator - Full Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the SAP FS Generator with docx generation, SAP SE11 parsing, field mapping, and multi-AI backend support.

**Architecture:** Multi-backend AI system with React Context state management, using docx library for Word generation and exceljs for Excel exports.

**Tech Stack:** Next.js 16, React 19, shadcn/ui, docx, exceljs, OpenAI SDK

---

## Prerequisites

### Step 1: Install required dependencies

**Run:**
```bash
npm install docx exceljs
npm install -D @types/uuid
```

---

## Task 1: Install and Configure shadcn/ui

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts` (create if needed)
- Create: `src/components.json` (shadcn config)

**Step 1: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

Select:
- Style: Default
- Base Color: Slate
- CSS variables: Yes

**Step 2: Add shadcn components**

Run:
```bash
npx shadcn@latest add button card input textarea dialog tabs sheet dropdown-menu select label -y
```

---

## Task 2: Create AI Backend Adapter

**Files:**
- Create: `src/lib/ai/adapters.ts`
- Create: `src/lib/ai/config.ts`
- Modify: `src/lib/openai.ts`

**Step 1: Create AI config**

```typescript
// src/lib/ai/config.ts
export type AIBackend = 'openai' | 'gemini';

export interface AIConfig {
  backend: AIBackend;
  model: string;
  apiKey?: string;
}

export const defaultAIConfig: AIConfig = {
  backend: 'openai',
  model: 'gpt-4o',
};
```

**Step 2: Create AI adapters**

```typescript
// src/lib/ai/adapters.ts
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
请用中文回复。`;

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0]?.message?.content || '生成失败';
}

async function generateWithGemini(prompt: string, templateContent?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fullPrompt = `你是SAP FS文档生成专家。请根据以下需求生成功能规格文档：${prompt}`;
    const gemini = spawn('gemini', ['--no-interactive', 'prompt', '--', fullPrompt]);
    
    let output = '';
    gemini.stdout.on('data', (data) => { output += data.toString(); });
    gemini.on('close', (code) => {
      if (code !== 0) resolve('[MOCK] Gemini CLI不可用，请配置OpenAI API');
      else resolve(output.trim());
    });
    gemini.on('error', () => resolve('[MOCK] Gemini CLI不可用'));
  });
}
```

---

## Task 3: Create Document Generation API

**Files:**
- Create: `src/app/api/generate/route.ts`
- Create: `src/lib/docx/generator.ts`

**Step 1: Create docx generator**

```typescript
// src/lib/docx/generator.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export interface FSDocumentData {
  title: string;
  overview: string;
  businessBackground: string;
  functionalRequirements: string;
  processFlow: string;
  interfaceRequirements: string;
  dataRequirements: string;
  errorHandling: string;
  acceptanceCriteria: string;
  fieldMappings?: { fieldName: string; dataType: string; length: string; description: string }[];
}

export async function generateFSWordDoc(data: FSDocumentData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: data.title || '功能规格文档',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Sections
  const sections = [
    { title: '1. 文档概述', content: data.overview },
    { title: '2. 业务背景与目标', content: data.businessBackground },
    { title: '3. 功能需求描述', content: data.functionalRequirements },
    { title: '4. 业务流程', content: data.processFlow },
    { title: '5. 接口需求', content: data.interfaceRequirements },
    { title: '6. 数据要求', content: data.dataRequirements },
    { title: '7. 异常处理', content: data.errorHandling },
    { title: '8. 验收标准', content: data.acceptanceCriteria },
  ];

  for (const section of sections) {
    if (section.content) {
      children.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 100 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun(section.content)],
          spacing: { after: 200 },
        })
      );
    }
  }

  // Field mapping table if exists
  if (data.fieldMappings && data.fieldMappings.length > 0) {
    children.push(
      new Paragraph({
        text: '9. 字段映射表',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 100 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph('字段名')] }),
          new TableCell({ children: [new Paragraph('数据类型')] }),
          new TableCell({ children: [new Paragraph('长度')] }),
          new TableCell({ children: [new Paragraph('描述')] }),
        ],
      }),
      ...data.fieldMappings.map(
        (field) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(field.fieldName)] }),
              new TableCell({ children: [new Paragraph(field.dataType)] }),
              new TableCell({ children: [new Paragraph(field.length)] }),
              new TableCell({ children: [new Paragraph(field.description)] }),
            ],
          })
      ),
    ];

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
```

**Step 2: Create generate API route**

```typescript
// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateFSWordDoc } from '@/lib/docx/generator';
import { generateExcelExport } from '@/lib/excel/exporter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { format, content, fieldMappings } = body;

    if (format === 'docx') {
      const docBuffer = await generateFSWordDoc(content);
      return new NextResponse(docBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': 'attachment; filename="FS-Document.docx"',
        },
      });
    } else if (format === 'xlsx' && fieldMappings) {
      const excelBuffer = await generateExcelExport(fieldMappings);
      return new NextResponse(excelBuffer, {
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
```

---

## Task 4: Create Excel Exporter

**Files:**
- Create: `src/lib/excel/exporter.ts`

**Step 1: Create Excel exporter**

```typescript
// src/lib/excel/exporter.ts
import ExcelJS from 'exceljs';

export interface FieldMapping {
  fieldName: string;
  dataType: string;
  length: string;
  description: string;
}

export async function generateExcelExport(fields: FieldMapping[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('字段映射');

  worksheet.columns = [
    { header: '字段名', key: 'fieldName', width: 20 },
    { header: '数据类型', key: 'dataType', width: 15 },
    { header: '长度', key: 'length', width: 10 },
    { header: '描述', key: 'description', width: 40 },
  ];

  for (const field of fields) {
    worksheet.addRow(field);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
```

---

## Task 5: Create SE11 Excel Parser

**Files:**
- Create: `src/app/api/sap-parse/route.ts`
- Create: `src/lib/parser/se11-parser.ts`

**Step 1: Create SE11 parser**

```typescript
// src/lib/parser/se11-parser.ts
import ExcelJS from 'exceljs';
import { FieldMapping } from '@/lib/excel/exporter';

export interface SAPTableInfo {
  tableName: string;
  description: string;
  fields: FieldMapping[];
}

export async function parseSE11Excel(buffer: Buffer): Promise<SAPTableInfo> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error('No worksheet found');

  const fields: FieldMapping[] = [];
  let tableName = '';
  let description = '';

  worksheet.eachRow((row, rowNum) => {
    if (rowNum === 1) {
      // Header row - could be table name
      const cellValue = row.getCell(1).value?.toString() || '';
      if (cellValue.toLowerCase().includes('table') || cellValue.length > 0) {
        tableName = cellValue;
      }
      return;
    }

    // Try to parse field data
    const fieldName = row.getCell(1)?.value?.toString()?.trim();
    const dataType = row.getCell(2)?.value?.toString()?.trim();
    const length = row.getCell(3)?.value?.toString()?.trim();
    const descriptionCell = row.getCell(4)?.value?.toString()?.trim();

    if (fieldName && fieldName.length > 0 && !fieldName.startsWith('#')) {
      fields.push({
        fieldName,
        dataType: dataType || '',
        length: length || '',
        description: descriptionCell || '',
      });
    }
  });

  return { tableName, description, fields };
}
```

**Step 2: Create SAP parse API route**

```typescript
// src/app/api/sap-parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseSE11Excel } from '@/lib/parser/se11-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseSE11Excel(buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error('SAP parse error:', error);
    return NextResponse.json({ error: '解析失败' }, { status: 500 });
  }
}
```

---

## Task 6: Create Settings Component

**Files:**
- Create: `src/app/components/Settings/SettingsDialog.tsx`

**Step 1: Create Settings dialog**

```typescript
// src/app/components/Settings/SettingsDialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AIConfig, AIBackend } from '@/lib/ai/config';

interface SettingsDialogProps {
  config: AIConfig;
  onSave: (config: AIConfig) => void;
}

export function SettingsDialog({ config, onSave }: SettingsDialogProps) {
  const [backend, setBackend] = useState<AIBackend>(config.backend);
  const [model, setModel] = useState(config.model);
  const [apiKey, setApiKey] = useState(config.apiKey || '');

  const handleSave = () => {
    onSave({ backend, model, apiKey: apiKey || undefined });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">⚙️ 设置</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI 配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>AI 后端</Label>
            <Select value={backend} onValueChange={(v) => setBackend(v as AIBackend)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Gemini CLI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>模型</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o" />
          </div>
          {backend === 'openai' && (
            <div>
              <Label>API Key</Label>
              <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
            </div>
          )}
          <Button onClick={handleSave} className="w-full">保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Task 7: Create Document Preview Component

**Files:**
- Create: `src/app/components/Preview/DocumentPreview.tsx`

**Step 1: Create preview component**

```typescript
// src/app/components/Preview/DocumentPreview.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FSDocumentData } from '@/lib/docx/generator';
import { FieldMapping } from '@/lib/excel/exporter';

interface DocumentPreviewProps {
  content: FSDocumentData;
  fieldMappings: FieldMapping[];
  onContentChange: (content: FSDocumentData) => void;
}

export function DocumentPreview({ content, fieldMappings, onContentChange }: DocumentPreviewProps) {
  const [activeTab, setActiveTab] = useState('preview');

  const handleExport = async (format: 'docx' | 'xlsx') => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          content: format === 'docx' ? content : undefined,
          fieldMappings: format === 'xlsx' ? fieldMappings : undefined,
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'docx' ? 'FS-Document.docx' : 'Field-Mappings.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>文档预览</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('docx')}>导出 Word</Button>
          <Button variant="outline" onClick={() => handleExport('xlsx')}>导出 Excel</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="fields">字段映射</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="space-y-4 mt-4">
            <div>
              <h3 className="font-semibold">{content.title || '功能规格文档'}</h3>
            </div>
            {content.overview && <div><h4 className="font-medium">概述</h4><p>{content.overview}</p></div>}
            {content.businessBackground && <div><h4 className="font-medium">业务背景</h4><p>{content.businessBackground}</p></div>}
            {content.functionalRequirements && <div><h4 className="font-medium">功能需求</h4><p>{content.functionalRequirements}</p></div>}
          </TabsContent>
          <TabsContent value="edit" className="space-y-4 mt-4">
            <Textarea
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => {
                try {
                  onContentChange(JSON.parse(e.target.value));
                } catch {}
              }}
              className="min-h-[400px] font-mono text-sm"
            />
          </TabsContent>
          <TabsContent value="fields" className="mt-4">
            {fieldMappings.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">字段名</th>
                    <th className="text-left p-2">类型</th>
                    <th className="text-left p-2">长度</th>
                    <th className="text-left p-2">描述</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldMappings.map((f, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{f.fieldName}</td>
                      <td className="p-2">{f.dataType}</td>
                      <td className="p-2">{f.length}</td>
                      <td className="p-2">{f.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">暂无字段映射数据</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

---

## Task 8: Create SAP Parser Component

**Files:**
- Create: `src/app/components/SAPParser/SAPParser.tsx`

**Step 1: Create SAP parser component**

```typescript
// src/app/components/SAPParser/SAPParser.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldMapping } from '@/lib/excel/exporter';

interface SAPParserProps {
  onFieldsParsed: (fields: FieldMapping[], tableName: string) => void;
}

export function SAPParser({ onFieldsParsed }: SAPParserProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [tableName, setTableName] = useState('');

  const handleParse = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/sap-parse', { method: 'POST', body: formData });
      const data = await res.json();
      setTableName(data.tableName || '');
      onFieldsParsed(data.fields || [], data.tableName);
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SE11 表结构解析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>上传 SE11 导出的 Excel 文件</Label>
          <Input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <Button onClick={handleParse} disabled={!file || loading}>
          {loading ? '解析中...' : '解析'}
        </Button>
        {tableName && <p className="text-sm text-green-600">已解析表: {tableName}</p>}
      </CardContent>
    </Card>
  );
}
```

---

## Task 9: Update Main Page with All Features

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update page.tsx**

Replace with enhanced version that includes all components, preview, SAP parser, and settings.

---

## Task 10: Run Lint and Build

**Step 1: Run lint**

```bash
npm run lint
```

**Step 2: Run build**

```bash
npm run build
```

---

## Execution Choice

**Plan complete and saved to `docs/plans/2026-02-13-sap-fs-generator-implementation-plan.md`.**

Two execution options:

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
