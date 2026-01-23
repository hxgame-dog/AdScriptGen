import { Clock, Trash2, Edit2, Filter, X } from 'lucide-react';
import { useState, useMemo } from 'react';

interface HistoryListProps {
  scripts: any[];
  onSelect: (script: any) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
}

export default function HistoryList({ scripts, onSelect, onDelete, onRename }: HistoryListProps) {
  const [filterText, setFilterText] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Filter scripts
  const filteredScripts = useMemo(() => {
    if (!filterText) return scripts;
    const lowerFilter = filterText.toLowerCase();
    
    return scripts.filter(script => {
        // Search in title, creator, and tags
        const titleMatch = (script.title || '').toLowerCase().includes(lowerFilter);
        const creatorMatch = (script.creator || '').toLowerCase().includes(lowerFilter);
        
        let paramsMatch = false;
        if (script.parameters) {
            try {
                const params = typeof script.parameters === 'string' 
                    ? JSON.parse(script.parameters) 
                    : script.parameters;
                const tagsStr = Object.values(params).join(' ').toLowerCase();
                paramsMatch = tagsStr.includes(lowerFilter);
            } catch(e) {}
        }

        return titleMatch || creatorMatch || paramsMatch;
    });
  }, [scripts, filterText]);

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

  if (scripts.length === 0) {
    return (
      <div className="bg-[var(--bg-color)] h-full flex flex-col items-center justify-center p-6 text-center border-l border-[var(--border)]">
         <Clock className="w-6 h-6 text-[var(--muted)] mb-2 opacity-50" />
         <p className="text-sm text-[var(--muted)] font-medium">No History Yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-color)] h-full flex flex-col border-l border-[var(--border)]">
      <div className="p-4 flex items-center justify-between mb-2">
        <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-[var(--muted)]" />
            <h2 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">History</h2>
        </div>
        <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-1.5 rounded-[4px] transition-all ${showFilter ? 'text-[var(--accent)] bg-[var(--accent-light)]' : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'}`}
        >
            <Filter className="w-3.5 h-3.5" />
        </button>
      </div>

      {showFilter && (
        <div className="px-4 mb-4">
            <div className="relative">
                <input 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Filter by tag, user..."
                    className="notion-input pl-8"
                    autoFocus
                />
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted)] opacity-50" />
                {filterText && (
                    <button 
                        onClick={() => setFilterText('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
      )}

      <div className="overflow-y-auto flex-1 custom-scrollbar px-3 pb-3 space-y-3">
        {filteredScripts.map((script) => (
          <div
            key={script.id}
            className="w-full text-left p-3 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-md transition-all group relative"
          >
            <div 
                className="cursor-pointer"
                onClick={() => onSelect(script)}
            >
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-[var(--foreground)] truncate pr-8 leading-tight">
                    {script.title || "Untitled Script"}
                    </h3>
                </div>
                
                {/* Parameters Tags */}
                {(() => {
                    let params = script.parameters;
                    if (typeof params === 'string') {
                        try { params = JSON.parse(params); } catch(e) {}
                    }
                    if (params && typeof params === 'object') {
                        // Helper to extract Chinese content from parens or fallback
                        const extractTag = (str: string) => {
                            if (!str) return '';
                            const match = str.match(/\(([^)]+)\)/);
                            return match ? match[1] : str.split('(')[0].trim();
                        };

                        // All relevant tags in order
                        const tags = [
                            extractTag(params.visualTheme),
                            extractTag(params.cameraAngle),
                            extractTag(params.coreInteraction),
                            extractTag(params.copyHook),
                            extractTag(params.audioDesign),
                            extractTag(params.scriptFlow),
                            extractTag(params.ending),
                        ].filter(Boolean);
                        
                        // Game Name
                        const gameName = params.gameName;

                        return (
                            <div className="mb-2">
                                {gameName && (
                                    <div className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider mb-1.5 flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-1.5"></span>
                                        {gameName}
                                    </div>
                                )}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag, i) => (
                                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-[3px] font-medium border ${TAG_COLORS[i % TAG_COLORS.length].replace('bg-', 'bg-opacity-10 bg-').replace('border-', 'border-opacity-20 border-')}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return null;
                })()}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)] border-dashed">
                    <div className="flex items-center text-[10px] text-[var(--muted)] space-x-2 font-mono">
                        <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                        {script.creator && script.creator !== 'Anonymous' && (
                            <span className="font-bold text-[var(--accent)]">@{script.creator}</span>
                        )}
                    </div>
                    <span className="text-[9px] text-[var(--muted)] font-mono opacity-60">
                        {script.modelUsed}
                    </span>
                </div>
            </div>
            
            {/* Actions */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--surface)] pl-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onRename(script.id, script.title); }}
                    className="p-1 hover:bg-[var(--bg-color)] rounded text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    title="Rename"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(script.id); }}
                    className="p-1 hover:bg-[var(--bg-color)] rounded text-[var(--muted)] hover:text-red-600 transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
