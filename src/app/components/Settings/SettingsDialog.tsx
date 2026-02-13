'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
