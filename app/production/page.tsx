'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, PlayCircle, CheckCircle, MoreHorizontal } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  creator: string;
  status: 'draft' | 'pending' | 'producing' | 'completed';
  createdAt: string;
  modelUsed: string;
  content: any; // Parsed content
  parameters?: any; // Parsed or string
  videoUrl?: string; // New: Video URL
  rating?: 'S' | 'A' | 'B' | 'C'; // New: Rating
}

const STATUS_CONFIG = {
  draft: { label: '草稿 (Draft)', color: 'bg-gray-100 text-gray-600', icon: MoreHorizontal },
  pending: { label: '待制作 (Pending)', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  producing: { label: '制作中 (Producing)', color: 'bg-blue-100 text-blue-700', icon: PlayCircle },
  completed: { label: '已完成 (Completed)', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function ProductionPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Parse content if string
        const parsedData = data.map((s: any) => ({
            ...s,
            content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
            status: s.status || 'draft' // Default to draft if undefined
        }));
        setScripts(parsedData);
      }
    } catch (e) {
      console.error("Failed to load scripts", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // Optimistic update
    setScripts(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));

    try {
      const res = await fetch('/api/scripts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Failed to update');
      }
    } catch (e) {
      alert('状态更新失败');
      fetchScripts(); // Revert
    }
  };

  const updateField = async (id: string, field: string, value: any) => {
    // Optimistic update
    setScripts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

    try {
      const res = await fetch('/api/scripts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value })
      });
      if (!res.ok) {
        throw new Error('Failed to update');
      }
    } catch (e) {
      console.error(e);
      alert('更新失败');
      fetchScripts(); // Revert
    }
  };

  const renderScriptCard = (script: Script, status: string) => {
    let params: any = script.parameters;
    if (typeof params === 'string') {
        try { params = JSON.parse(params); } catch(e) {}
    }

    // Helper to extract Chinese content from parens or fallback
    const extractTag = (str: string) => {
        if (!str) return '';
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str.split('(')[0].trim();
    };

    const tags = params && typeof params === 'object' ? [
        extractTag(params.visualTheme),
        extractTag(params.cameraAngle),
        extractTag(params.coreInteraction),
        extractTag(params.copyHook),
        extractTag(params.audioDesign),
        extractTag(params.scriptFlow),
        extractTag(params.ending),
    ].filter(Boolean) : [];

    // Tag Colors
    const TAG_COLORS = [
        'bg-red-50 text-red-600 border border-red-100',
        'bg-orange-50 text-orange-600 border border-orange-100',
        'bg-amber-50 text-amber-600 border border-amber-100',
        'bg-green-50 text-green-600 border border-green-100',
        'bg-teal-50 text-teal-600 border border-teal-100',
        'bg-blue-50 text-blue-600 border border-blue-100',
        'bg-indigo-50 text-indigo-600 border border-indigo-100',
        'bg-purple-50 text-purple-600 border border-purple-100',
        'bg-pink-50 text-pink-600 border border-pink-100',
    ];

    const gameName = params?.gameName;

    return (
        <div key={script.id} className="bg-white p-4 rounded-md shadow-sm border border-[#E9E9E7] hover:shadow-md transition-shadow group">
            <div className="flex flex-col mb-2">
                {gameName && (
                    <div className="text-base font-bold text-[#37352F] mb-1.5 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2383E2] mr-2"></span>
                        {gameName}
                    </div>
                )}
                <h3 className="text-sm font-medium text-[#37352F] line-clamp-2 leading-tight opacity-80">{script.title}</h3>
            </div>
            
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map((tag: string, i: number) => (
                        <span key={i} className={`text-[9px] px-1 py-0.5 rounded-sm opacity-80 ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-[#37352F] opacity-60 mb-3">
                <div className="flex items-center space-x-2">
                        <span>@{script.creator || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="border border-[#E9E9E7] px-1 rounded">{script.modelUsed}</span>
            </div>

            {/* Video URL & Rating Inputs */}
            {status === 'completed' && (
                <div className="mb-3 space-y-2 bg-gray-50 p-2 rounded border border-gray-100">
                    <div>
                        <input 
                            type="text" 
                            placeholder="输入素材访问路径..." 
                            className="w-full text-xs p-1.5 border border-gray-200 rounded focus:border-blue-500 outline-none bg-white"
                            value={script.videoUrl || ''}
                            onChange={(e) => updateField(script.id, 'videoUrl', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-medium uppercase">素材评级</span>
                        <select 
                            className="text-xs p-1 border border-gray-200 rounded focus:border-blue-500 outline-none bg-white"
                            value={script.rating || ''}
                            onChange={(e) => updateField(script.id, 'rating', e.target.value)}
                        >
                            <option value="">未评级</option>
                            <option value="S">S 级 (Excellent)</option>
                            <option value="A">A 级 (Good)</option>
                            <option value="B">B 级 (Average)</option>
                            <option value="C">C 级 (Poor)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-[#E9E9E7] mt-2">
                {status === 'pending' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'producing')}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition-colors"
                    >
                        开始制作
                    </button>
                )}
                {status === 'producing' && (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => updateStatus(script.id, 'pending')}
                            className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        >
                            退回
                        </button>
                        <button 
                            onClick={() => updateStatus(script.id, 'completed')}
                            className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 font-medium transition-colors"
                        >
                            完成
                        </button>
                    </div>
                )}
                {status === 'completed' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'producing')}
                        className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                    >
                        重新制作
                    </button>
                )}
                {status === 'draft' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'pending')}
                        className="w-full py-1.5 text-xs bg-[#37352F] text-white rounded hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                    >
                        提交制作
                    </button>
                )}
            </div>
        </div>
    );
  };

  const renderColumn = (status: 'pending' | 'producing' | 'completed') => {
    const columnScripts = scripts.filter(s => s.status === status);
    const Config = STATUS_CONFIG[status];
    const Icon = Config.icon;

    return (
      <div className="flex-1 min-w-[300px] bg-[#F7F7F5] rounded-lg p-4 flex flex-col h-full border border-[#E9E9E7]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E9E9E7]">
            <div className="flex items-center space-x-2">
                <Icon className={`w-4 h-4 ${Config.color.split(' ')[1]}`} />
                <h2 className="text-sm font-semibold text-[#37352F] uppercase tracking-wider">{Config.label}</h2>
            </div>
            <span className="text-xs font-bold text-[#37352F] opacity-40 bg-white px-2 py-0.5 rounded-full border border-[#E9E9E7]">
                {columnScripts.length}
            </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {columnScripts.map(script => renderScriptCard(script, status))}
            {columnScripts.length === 0 && (
                <div className="text-center py-10 opacity-30 text-sm">
                    暂无任务
                </div>
            )}
        </div>
      </div>
    );
  };

  const draftScripts = scripts.filter(s => s.status === 'draft' || !s.status);

  // Statistics
  const stats = {
      total: scripts.length,
      pending: scripts.filter(s => s.status === 'pending').length,
      producing: scripts.filter(s => s.status === 'producing').length,
      completed: scripts.filter(s => s.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#37352F] flex flex-col h-screen overflow-hidden">
      <header className="h-14 border-b border-[#E9E9E7] flex items-center px-6 justify-between flex-shrink-0 bg-white z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#37352F]" />
          </Link>
          <h1 className="text-base font-semibold text-[#37352F]">脚本制作看板</h1>
        </div>
        <div className="flex items-center space-x-4 text-xs text-[#37352F]">
            <div className="flex items-center space-x-1">
                <span className="opacity-60">待制作</span>
                <span className="font-bold bg-yellow-100 text-yellow-700 px-1.5 rounded">{stats.pending}</span>
            </div>
            <div className="flex items-center space-x-1">
                <span className="opacity-60">制作中</span>
                <span className="font-bold bg-blue-100 text-blue-700 px-1.5 rounded">{stats.producing}</span>
            </div>
            <div className="flex items-center space-x-1">
                <span className="opacity-60">已完成</span>
                <span className="font-bold bg-green-100 text-green-700 px-1.5 rounded">{stats.completed}</span>
            </div>
            <div className="h-4 w-[1px] bg-[#E9E9E7]"></div>
            <div className="flex items-center space-x-1 opacity-40">
                <span>总计</span>
                <span>{stats.total}</span>
            </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar: Drafts */}
        <div className="w-[280px] border-r border-[#E9E9E7] bg-[#FAFAFA] flex flex-col min-h-0">
            <div className="p-4 border-b border-[#E9E9E7]">
                <h2 className="text-xs font-semibold text-[#37352F] uppercase tracking-wider mb-1">待提交 (Drafts)</h2>
                <p className="text-[10px] text-gray-400">选择脚本提交给制作组</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {draftScripts.map(script => (
                    <div key={script.id} className="bg-white p-3 rounded border border-[#E9E9E7] hover:shadow-sm transition-shadow group">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-medium text-[#37352F] truncate">{script.title}</h3>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
                             <span>@{script.creator || 'Anonymous'}</span>
                             <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                            onClick={() => updateStatus(script.id, 'pending')}
                            className="w-full py-1.5 text-xs bg-[#37352F] text-white rounded hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                        >
                            提交制作
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Board */}
        <div className="flex-1 overflow-x-auto p-6 bg-white">
            <div className="flex space-x-6 h-full min-w-[900px]">
                {renderColumn('pending')}
                {renderColumn('producing')}
                {renderColumn('completed')}
            </div>
        </div>
      </div>
    </div>
  );
}