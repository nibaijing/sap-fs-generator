'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FieldMapping {
  fieldName: string;
  dataType: string;
  length: string;
  description: string;
}

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
