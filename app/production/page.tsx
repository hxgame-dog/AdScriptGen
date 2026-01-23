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
        <div key={script.id} className="notion-card p-4 group">
            <div className="flex flex-col mb-3">
                {gameName && (
                    <div className="text-xs font-bold text-[var(--accent)] mb-1.5 flex items-center tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-2"></span>
                        {gameName}
                    </div>
                )}
                <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-tight">{script.title}</h3>
            </div>
            
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map((tag: string, i: number) => (
                        <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-[3px] font-medium border uppercase tracking-wider ${TAG_COLORS[i % TAG_COLORS.length].replace('bg-', 'bg-opacity-10 bg-').replace('border-', 'border-opacity-20 border-')}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-[var(--muted)] opacity-80 mb-3 font-mono">
                <div className="flex items-center space-x-2">
                        <span className="font-medium text-[var(--foreground)]">@{script.creator || 'Anon'}</span>
                        <span>•</span>
                        <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="border border-[var(--border)] px-1.5 py-0.5 rounded-[3px] bg-[var(--bg-color)]">{script.modelUsed}</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-[var(--border)] border-dashed mt-2">
                {status === 'pending' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'producing')}
                        className="text-xs px-3 py-1.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-[var(--radius)] hover:bg-[var(--accent)] hover:text-white font-bold transition-all uppercase tracking-wider"
                    >
                        Start Production
                    </button>
                )}
                {status === 'producing' && (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => updateStatus(script.id, 'pending')}
                            className="text-xs px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--bg-color)] rounded-[var(--radius)] transition-colors font-medium"
                        >
                            Return
                        </button>
                        <button 
                            onClick={() => updateStatus(script.id, 'completed')}
                            className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-[var(--radius)] hover:bg-green-100 font-bold transition-colors uppercase tracking-wider border border-green-100"
                        >
                            Complete
                        </button>
                    </div>
                )}
                {status === 'completed' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'producing')}
                        className="text-xs px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--bg-color)] rounded-[var(--radius)] transition-colors font-medium"
                    >
                        Rework
                    </button>
                )}
                {status === 'draft' && (
                    <button 
                        onClick={() => updateStatus(script.id, 'pending')}
                        className="w-full py-2 text-xs bg-[var(--foreground)] text-white rounded-[var(--radius)] hover:bg-black transition-all font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                        Submit to Production
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
      <div className="flex-1 min-w-[320px] bg-[var(--bg-color)] rounded-[var(--radius)] p-4 flex flex-col h-full border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-[4px] ${Config.color.replace('text-', 'bg-opacity-20 bg-')}`}>
                    <Icon className={`w-4 h-4 ${Config.color.split(' ')[1]}`} />
                </div>
                <h2 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">{Config.label.split('(')[1].replace(')', '')}</h2>
            </div>
            <span className="text-xs font-bold text-[var(--foreground)] bg-[var(--surface)] px-2.5 py-0.5 rounded-full border border-[var(--border)] shadow-sm">
                {columnScripts.length}
            </span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {columnScripts.map(script => renderScriptCard(script, status))}
            {columnScripts.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-sm font-medium text-[var(--muted)]">
                    <div className="w-12 h-12 border-2 border-dashed border-[var(--muted)] rounded-full flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5" />
                    </div>
                    No Tasks
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
    <div className="min-h-screen bg-[var(--bg-color)] font-sans text-[var(--foreground)] flex flex-col h-screen overflow-hidden selection:bg-[var(--accent)] selection:text-white">
      <header className="h-14 glass-panel flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1.5 hover:bg-[var(--accent-light)] hover:text-[var(--accent)] rounded-[var(--radius)] transition-colors text-[var(--muted)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-bold text-[var(--foreground)] font-mono tracking-tight">Production Board</h1>
        </div>
        <div className="flex items-center space-x-6 text-xs text-[var(--foreground)] font-mono">
            <div className="flex items-center space-x-2">
                <span className="opacity-50 uppercase tracking-wider">Pending</span>
                <span className="font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-100">{stats.pending}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="opacity-50 uppercase tracking-wider">Producing</span>
                <span className="font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{stats.producing}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="opacity-50 uppercase tracking-wider">Done</span>
                <span className="font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{stats.completed}</span>
            </div>
            <div className="h-4 w-[1px] bg-[var(--border)]"></div>
            <div className="flex items-center space-x-2 opacity-60">
                <span className="uppercase tracking-wider">Total</span>
                <span className="font-bold">{stats.total}</span>
            </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar: Drafts */}
        <div className="w-[280px] border-r border-[var(--border)] bg-[var(--surface)] flex flex-col min-h-0">
            <div className="p-5 border-b border-[var(--border)]">
                <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest mb-1">Drafts</h2>
                <p className="text-[10px] text-[var(--muted)] opacity-60">Select to submit for production</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {draftScripts.map(script => renderScriptCard(script, 'draft'))}
            </div>
        </div>

        {/* Main Board */}
        <div className="flex-1 overflow-x-auto p-6 bg-[var(--bg-color)]">
            <div className="flex space-x-6 h-full min-w-[960px]">
                {renderColumn('pending')}
                {renderColumn('producing')}
                {renderColumn('completed')}
            </div>
        </div>
      </div>
    </div>
  );
}