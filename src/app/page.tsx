'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, UploadedFile } from '@/types';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好！我是 SAP FS 文档生成助手。请描述你的功能需求，或上传 docx/excel 模板作为参考。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          files,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.file) {
        setFiles((prev) => [...prev, data.file]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">SAP FS Generator</h1>
        <p className="text-gray-600">AI 驱动的功能规格文档生成器</p>
      </header>

      {/* 文件上传区 */}
      {files.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm font-medium mb-2">已上传模板：</p>
          <div className="flex gap-2 flex-wrap">
            {files.map((f) => (
              <span key={f.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {f.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 消息区 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 border rounded-lg p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.role === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[90%]'}`}>
            <div
              className={`p-3 rounded-lg whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 text-sm">AI 正在生成文档...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
          <span>📎 上传模板</span>
          <input type="file" accept=".docx,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述你的功能需求..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
