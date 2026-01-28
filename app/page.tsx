'use client';

import { useState, useEffect } from 'react';
import { Tool, Doc } from '@/components/types';
import { ToolCard } from '@/components/ToolCard';
import { DocList } from '@/components/DocList';
import { LayoutGrid, BookOpen, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    const savedTools = localStorage.getItem('ad_ops_tools');
    const savedDocs = localStorage.getItem('ad_ops_docs');
    
    if (savedTools) {
      try {
        setTools(JSON.parse(savedTools));
      } catch (e) {
        console.error('Failed to parse tools', e);
      }
    }
    
    if (savedDocs) {
      try {
        setDocs(JSON.parse(savedDocs));
      } catch (e) {
        console.error('Failed to parse docs', e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen max-w-6xl mx-auto px-8 py-16">
      <header className="flex items-center justify-between mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-[#37352F]">
          投放运营工具台
        </h1>
        <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded hover:bg-gray-100">
          <Settings size={16} />
          <span>配置</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Zone A: Tools */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <LayoutGrid size={20} className="text-gray-500" />
            <h2 className="text-xl font-semibold text-[#37352F]">运营工具箱</h2>
          </div>
          
          {tools.length === 0 ? (
            <div className="py-12 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 bg-gray-50/50">
              <p className="text-sm">暂无工具</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          )}
        </section>

        {/* Zone B: Knowledge Base */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <BookOpen size={20} className="text-gray-500" />
            <h2 className="text-xl font-semibold text-[#37352F]">飞书知识库</h2>
          </div>

          {docs.length === 0 ? (
            <div className="py-12 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 bg-gray-50/50">
              <p className="text-sm">暂无文档</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg">
              <DocList docs={docs} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
