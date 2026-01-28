'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, ExternalLink, Eye, X } from 'lucide-react';
import ScriptResult from '@/components/ScriptResult';

interface Script {
  id: string;
  title: string;
  creator: string;
  status: string;
  createdAt: string;
  parameters: any;
  videoUrl?: string;
  rating?: string;
  content: any; // Added content
  modelUsed: string;
}

export default function AssetsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  // Filters
  const [gameFilter, setGameFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (Array.isArray(data)) {
        const completed = data
            .filter((s: any) => s.status === 'completed')
            .map((s: any) => ({
                ...s,
                parameters: typeof s.parameters === 'string' ? JSON.parse(s.parameters) : s.parameters,
                content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content
            }));
        setScripts(completed);
        setFilteredScripts(completed);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = scripts;

    if (gameFilter) {
        result = result.filter(s => s.parameters?.gameName === gameFilter);
    }

    if (ratingFilter) {
        result = result.filter(s => s.rating === ratingFilter);
    }

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(s => s.title.toLowerCase().includes(lower) || s.creator.toLowerCase().includes(lower));
    }

    setFilteredScripts(result);
  }, [gameFilter, ratingFilter, searchQuery, scripts]);

  // Extract unique game names
  const gameNames = Array.from(new Set(scripts.map(s => s.parameters?.gameName).filter(Boolean)));

  const getRatingColor = (rating?: string) => {
      switch(rating) {
          case 'S': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'A': return 'bg-green-100 text-green-700 border-green-200';
          case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'C': return 'bg-gray-100 text-gray-700 border-gray-200';
          default: return 'bg-gray-50 text-gray-500 border-gray-100';
      }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#37352F]">
      <header className="h-14 border-b border-[#E9E9E7] flex items-center px-6 justify-between flex-shrink-0 bg-white sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#37352F]" />
          </Link>
          <h1 className="text-base font-semibold text-[#37352F]">素材库 (Asset Library)</h1>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-[#F7F7F5] p-4 rounded-lg border border-[#E9E9E7]">
            <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">筛选:</span>
            </div>
            
            <select 
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="text-sm p-2 border border-gray-200 rounded focus:border-blue-500 outline-none bg-white min-w-[150px]"
            >
                <option value="">全部游戏</option>
                {gameNames.map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                ))}
            </select>

            <select 
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="text-sm p-2 border border-gray-200 rounded focus:border-blue-500 outline-none bg-white min-w-[120px]"
            >
                <option value="">全部评级</option>
                <option value="S">S 级</option>
                <option value="A">A 级</option>
                <option value="B">B 级</option>
                <option value="C">C 级</option>
            </select>

            <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text"
                    placeholder="搜索脚本标题或创建者..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:border-blue-500 outline-none"
                />
            </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E9E9E7] rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">游戏名称</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">脚本标题</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评级</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">素材链接</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建者</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成时间</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                             <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                 加载中...
                             </td>
                        </tr>
                    ) : filteredScripts.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                暂无符合条件的素材
                            </td>
                        </tr>
                    ) : (
                        filteredScripts.map((script) => (
                            <tr key={script.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                    {script.parameters?.gameName || '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    <div className="line-clamp-1 max-w-xs" title={script.title}>
                                        {script.title}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {script.rating ? (
                                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getRatingColor(script.rating)}`}>
                                            {script.rating} 级
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {script.videoUrl ? (
                                        <a 
                                            href={script.videoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 flex items-center hover:underline"
                                        >
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            查看素材
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-xs">未上传</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {script.creator}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(script.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => setSelectedScript(script)}
                                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        查看脚本
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-right">
            共 {filteredScripts.length} 个素材
        </div>

        {/* Script Details Modal */}
        {selectedScript && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-8">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-[#E9E9E7]">
                        <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-[#37352F]">{selectedScript.title}</span>
                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">{selectedScript.parameters?.gameName}</span>
                        </div>
                        <button 
                            onClick={() => setSelectedScript(null)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <ScriptResult 
                            script={{
                                ...selectedScript,
                                ...selectedScript.content // Spread content (meta_analysis, script_content)
                            }} 
                            onSave={() => {}} 
                            saving={false}
                            isNew={false}
                        />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}