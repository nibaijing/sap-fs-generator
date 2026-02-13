'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FSDocumentData {
  title: string;
  overview: string;
  businessBackground: string;
  functionalRequirements: string;
  processFlow: string;
  interfaceRequirements: string;
  dataRequirements: string;
  errorHandling: string;
  acceptanceCriteria: string;
}

interface FieldMapping {
  fieldName: string;
  dataType: string;
  length: string;
  description: string;
}

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
            {content.overview && <div><h4 className="font-medium">概述</h4><p className="text-sm">{content.overview}</p></div>}
            {content.businessBackground && <div><h4 className="font-medium">业务背景</h4><p className="text-sm">{content.businessBackground}</p></div>}
            {content.functionalRequirements && <div><h4 className="font-medium">功能需求</h4><p className="text-sm">{content.functionalRequirements}</p></div>}
            {content.processFlow && <div><h4 className="font-medium">业务流程</h4><p className="text-sm">{content.processFlow}</p></div>}
            {content.interfaceRequirements && <div><h4 className="font-medium">接口需求</h4><p className="text-sm">{content.interfaceRequirements}</p></div>}
            {content.dataRequirements && <div><h4 className="font-medium">数据要求</h4><p className="text-sm">{content.dataRequirements}</p></div>}
            {content.errorHandling && <div><h4 className="font-medium">异常处理</h4><p className="text-sm">{content.errorHandling}</p></div>}
            {content.acceptanceCriteria && <div><h4 className="font-medium">验收标准</h4><p className="text-sm">{content.acceptanceCriteria}</p></div>}
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
              <p className="text-gray-500">暂无字段映射数据，请上传 SE11 Excel 文件</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
