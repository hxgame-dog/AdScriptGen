import { Clock, Trash2, Edit2 } from 'lucide-react';

interface HistoryListProps {
  scripts: any[];
  onSelect: (script: any) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
}

export default function HistoryList({ scripts, onSelect, onDelete, onRename }: HistoryListProps) {
  if (scripts.length === 0) {
    return (
      <div className="bg-[#F7F7F5] h-full flex flex-col items-center justify-center p-6 text-center border-l border-[#E9E9E7]">
         <Clock className="w-6 h-6 text-[#9B9A97] mb-2" />
         <p className="text-sm text-[#37352F] opacity-40">暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F5] h-full flex flex-col border-l border-[#E9E9E7]">
      <div className="p-4 flex items-center mb-2">
        <Clock className="w-4 h-4 mr-2 text-[#37352F] opacity-60" />
        <h2 className="text-sm font-semibold text-[#37352F] uppercase tracking-wider">历史记录</h2>
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar px-2 pb-2">
        {scripts.map((script) => (
          <div
            key={script.id}
            className="w-full text-left p-3 mb-2 rounded-sm hover:bg-[#EFEFED] transition-colors group relative"
          >
            <div 
                className="cursor-pointer"
                onClick={() => onSelect(script)}
            >
                <h3 className="text-sm font-medium text-[#37352F] truncate mb-1 pr-12">
                {script.title || "未命名脚本"}
                </h3>
                <div className="flex items-center justify-between">
                <div className="flex items-center text-[10px] text-[#37352F] opacity-40 space-x-2">
                    <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                    {script.creator && script.creator !== 'Anonymous' && (
                        <span className="font-medium text-blue-600">@{script.creator}</span>
                    )}
                </div>
                <span className="text-[10px] bg-white text-[#37352F] opacity-60 px-1.5 py-0.5 rounded border border-[#E9E9E7] truncate max-w-[80px]">
                    {script.modelUsed}
                </span>
                </div>
            </div>
            
            {/* Actions */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.stopPropagation(); onRename(script.id, script.title); }}
                    className="p-1 hover:bg-white rounded text-gray-500 hover:text-blue-600"
                    title="重命名"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(script.id); }}
                    className="p-1 hover:bg-white rounded text-gray-500 hover:text-red-600"
                    title="删除"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
