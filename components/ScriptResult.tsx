import { Save, Copy, Check, FileText, Download, Edit3, Plus, Trash2, XCircle, LayoutList, Table as TableIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import HelpContent from './HelpContent';

interface ScriptResultProps {
  script: any;
  onSave: (updatedScript?: any) => void;
  onScriptChange?: (updatedScript: any) => void;
  saving: boolean;
  streamingContent?: string;
  isNew?: boolean; // If true, start in edit mode
  gameNames?: string[];
}

export default function ScriptResult({ script, onSave, onScriptChange, saving, streamingContent, isNew, gameNames = [] }: ScriptResultProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableScript, setEditableScript] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    if (script) {
        setEditableScript(JSON.parse(JSON.stringify(script))); // Deep copy
        if (isNew) {
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }
  }, [script, isNew]);

  // Show streaming content if available and script is not yet parsed
  if (streamingContent && !script) {
    // ... existing streaming render ...
    return (
        <div className="bg-white h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center space-x-2 mb-4 animate-pulse">
                <div className="w-2 h-2 bg-[#2383E2] rounded-full"></div>
                <span className="text-xs font-medium text-[#2383E2] uppercase tracking-wider">AI 思考生成中...</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-[#F7F7F5] p-4 rounded-sm border border-[#E9E9E7] font-mono text-xs text-[#37352F] whitespace-pre-wrap custom-scrollbar">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-[#37352F] ml-1 align-middle animate-pulse"></span>
            </div>
        </div>
    );
  }

  if (!script) {
    return (
      <div className="h-full flex flex-col bg-white rounded-sm overflow-y-auto custom-scrollbar">
        <HelpContent />
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(script, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHTML = () => {
    // ... existing export logic ...
    if (!script) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${script.title || 'AdScriptGen 脚本'}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; background: #f9f9f9; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { font-size: 24px; margin-bottom: 10px; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; }
        .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
        .analysis { background: #f0f7ff; padding: 20px; border-left: 4px solid #0070f3; margin-bottom: 30px; border-radius: 4px; }
        .analysis h3 { margin-top: 0; font-size: 16px; color: #0070f3; text-transform: uppercase; }
        .scene { margin-bottom: 30px; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
        .scene-header { background: #f5f5f5; padding: 10px 20px; border-bottom: 1px solid #eaeaea; font-weight: bold; display: flex; justify-content: space-between; }
        .scene-content { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; display: block; margin-bottom: 5px; }
        .value { font-size: 14px; }
        .full-width { grid-column: span 2; }
        .interaction { background: #fff8e1; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .text-overlay { font-size: 18px; font-family: serif; border-left: 3px solid #333; padding-left: 15px; margin-top: 10px; }
        @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 0; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>${script.title || '无标题脚本'}</h1>
        <div class="meta">
            <p><strong>生成时间:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>模型:</strong> ${script.modelUsed || 'AI Model'}</p>
        </div>

        ${script.meta_analysis ? `
        <div class="analysis">
            <h3>策略分析</h3>
            <p>${script.meta_analysis}</p>
        </div>
        ` : ''}

        <div class="scripts">
            ${script.script_content?.map((scene: any, index: number) => `
            <div class="scene">
                <div class="scene-header">
                    <span>${scene.time}</span>
                    <span>SCENE ${index + 1}</span>
                </div>
                <div class="scene-content">
                    <div class="field">
                        <span class="label">画面 (Visual)</span>
                        <div class="value">${scene.visual}</div>
                    </div>
                    <div class="field">
                        <span class="label">音效 (Audio)</span>
                        <div class="value">"${scene.audio}"</div>
                    </div>
                    ${scene.interaction ? `
                    <div class="field full-width">
                        <div class="interaction">
                            <span class="label">交互指令</span>
                            <div class="value">${scene.interaction}</div>
                        </div>
                    </div>
                    ` : ''}
                    ${scene.text ? `
                    <div class="field full-width">
                        <span class="label">文案 (Text)</span>
                        <div class="value text-overlay">${scene.text}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title || 'script'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- EDITING HANDLERS ---
  const handleEditChange = (field: string, value: string) => {
      setEditableScript((prev: any) => ({ ...prev, [field]: value }));
  };
  
  const handleGameNameChange = (value: string) => {
    setEditableScript((prev: any) => ({
      ...prev,
      parameters: { ...prev.parameters, gameName: value }
    }));
  };

  const handleSceneChange = (index: number, field: string, value: string) => {
      const newContent = [...editableScript.script_content];
      newContent[index] = { ...newContent[index], [field]: value };
      setEditableScript((prev: any) => ({ ...prev, script_content: newContent }));
  };

  const addScene = () => {
      const newScene = {
          time: '0-5s',
          visual: 'New Visual...',
          audio: 'New Audio...',
          interaction: '',
          text: '',
          prompt: ''
      };
      setEditableScript((prev: any) => ({ 
          ...prev, 
          script_content: [...(prev.script_content || []), newScene] 
      }));
  };

  const removeScene = (index: number) => {
      if (!confirm('确定删除该分镜吗？')) return;
      const newContent = editableScript.script_content.filter((_: any, i: number) => i !== index);
      setEditableScript((prev: any) => ({ ...prev, script_content: newContent }));
  };

  const saveEdits = () => {
      if (onScriptChange) {
          onScriptChange(editableScript);
      }
      setIsEditing(false);
  };

  const cancelEdits = () => {
      if (isNew) {
        // If it was new and we cancel, effectively we might want to clear it?
        // But for now just revert to initial blank state or do nothing?
        // Let's just keep editing mode if new, or alert user?
        if (confirm("放弃新建脚本?")) {
            // Ideally we should clear the selection in parent, but for now just revert
             setEditableScript(script); // Revert to blank
             setIsEditing(false); // This might show empty view if script was empty
        }
      } else {
        setEditableScript(script);
        setIsEditing(false);
      }
  };

  const { meta_analysis, script_content, production_guide } = isEditing ? editableScript : script;
  
  // Extract Tags
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

  const gameName = params?.gameName;

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
    'bg-red-50 text-red-600 border-red-100',
    'bg-orange-50 text-orange-600 border-orange-100',
    'bg-amber-50 text-amber-600 border-amber-100',
    'bg-green-50 text-green-600 border-green-100',
    'bg-teal-50 text-teal-600 border-teal-100',
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-pink-50 text-pink-600 border-pink-100',
  ];

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#E9E9E7] flex justify-between items-center bg-white sticky top-0 z-10">
        {/* Left Side: Status / Title Input */}
        <div className="flex flex-col space-y-1 flex-1 mr-4">
            <div className="flex items-center space-x-3 mb-1">
                {isEditing ? (
                    <div className="flex items-center space-x-2 w-full">
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">游戏:</span>
                        <div className="relative">
                            <select
                                value={editableScript?.parameters?.gameName || ''}
                                onChange={(e) => handleGameNameChange(e.target.value)}
                                className="text-xs px-2 py-1 pr-6 bg-gray-50 border border-gray-200 rounded focus:border-blue-500 outline-none w-auto max-w-[140px] appearance-none cursor-pointer truncate"
                            >
                                {gameNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                                {!gameNames.includes(editableScript?.parameters?.gameName) && editableScript?.parameters?.gameName && (
                                    <option value={editableScript.parameters.gameName}>{editableScript.parameters.gameName}</option>
                                )}
                            </select>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                        <input 
                            value={editableScript.title || ''}
                            onChange={(e) => handleEditChange('title', e.target.value)}
                            className="text-sm font-medium text-[#37352F] border-b border-gray-300 focus:border-blue-500 outline-none flex-1"
                            placeholder="请输入脚本标题..."
                        />
                    </div>
                ) : (
                    <>
                        {gameName && (
                            <div className="text-[10px] text-gray-500 font-semibold opacity-80 flex items-center bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                                <span className="w-1 h-1 rounded-full bg-[#2383E2] mr-1.5"></span>
                                {gameName}
                            </div>
                        )}
                        <span className="px-2 py-0.5 bg-[#E3E2E0] text-[#37352F] text-xs rounded-sm font-medium">
                            {isNew ? '新建脚本' : '已生成'}
                        </span>
                        <span className="text-sm text-[#37352F] opacity-60 font-medium truncate max-w-[200px]" title={script.title}>
                             {script.title || '无标题脚本'}
                        </span>
                        <span className="text-xs text-gray-400">
                            • {script_content?.length || 0} 个分镜
                        </span>
                    </>
                )}
            </div>
            {!isEditing && tags.length > 0 && (
                <div className="flex space-x-1">
                    {tags.map((tag: string, i: number) => (
                        <span key={i} className={`text-[10px] px-1.5 rounded-sm border ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex space-x-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-2 border border-gray-200">
            <button
                onClick={() => setViewMode('card')}
                className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === 'card' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="结构化视图"
            >
                <LayoutList className="w-4 h-4" />
            </button>
            <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                title="表格视图"
            >
                <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {!isEditing ? (
              <>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="notion-button notion-button-secondary flex items-center"
                >
                    <Edit3 className="w-4 h-4 mr-1" />
                    编辑
                </button>
                <button 
                    onClick={handleExportHTML}
                    className="notion-button notion-button-secondary flex items-center"
                    title="导出 HTML"
                >
                    <Download className="w-4 h-4 mr-1" />
                    导出
                </button>
                <button 
                    onClick={handleCopy}
                    className="notion-button notion-button-secondary flex items-center"
                    title="复制 JSON"
                >
                    {copied ? <Check className="w-4 h-4 text-green-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? '已复制' : '复制'}
                </button>
              </>
          ) : (
              <button 
                  onClick={cancelEdits}
                  className="notion-button notion-button-secondary flex items-center text-red-600 hover:bg-red-50"
              >
                  <XCircle className="w-4 h-4 mr-1" />
                  取消
              </button>
          )}

          <button 
            onClick={isEditing ? saveEdits : () => onSave(script)}
            disabled={saving}
            className="notion-button notion-button-primary flex items-center"
          >
            {isEditing ? <Check className="w-4 h-4 mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {isEditing ? '完成编辑' : (saving ? '保存中...' : '保存脚本')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Meta Analysis */}
        <div className="mb-8 p-4 bg-[#F7F7F5] rounded-sm border border-[#E9E9E7]">
            <h3 className="text-xs font-semibold text-[#37352F] opacity-60 uppercase tracking-widest mb-2">策略分析</h3>
            {isEditing ? (
                <textarea 
                    value={meta_analysis || ''}
                    onChange={(e) => handleEditChange('meta_analysis', e.target.value)}
                    className="w-full h-24 text-sm p-2 border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="在此输入策略分析..."
                />
            ) : (
                <p className="text-[#37352F] text-sm leading-relaxed">{meta_analysis}</p>
            )}
        </div>

        {/* Production Guide */}
        <div className="mb-8 p-4 bg-blue-50 rounded-sm border border-blue-100">
            <h3 className="text-xs font-semibold text-blue-800 opacity-80 uppercase tracking-widest mb-2">视频制作指南</h3>
            {isEditing ? (
                <textarea 
                    value={production_guide || ''}
                    onChange={(e) => handleEditChange('production_guide', e.target.value)}
                    className="w-full h-24 text-sm p-2 border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="在此输入视频制作指南..."
                />
            ) : (
                <div className="text-[#37352F] text-sm leading-relaxed whitespace-pre-wrap">{production_guide}</div>
            )}
        </div>

        {/* Script Content */}
        <div className="space-y-8">
          {viewMode === 'card' ? (
            <>
                {script_content?.map((scene: any, index: number) => (
                    <div key={index} className="group relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E9E9E7] group-hover:bg-[#2383E2] transition-colors"></div>
                    
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-baseline">
                            {isEditing ? (
                                <input 
                                    value={scene.time}
                                    onChange={(e) => handleSceneChange(index, 'time', e.target.value)}
                                    className="text-base font-bold text-[#37352F] mr-3 font-mono border-b border-gray-300 w-20 focus:border-blue-500 outline-none bg-transparent"
                                />
                            ) : (
                                <span className="text-base font-bold text-[#37352F] mr-3 font-mono">{scene.time}</span>
                            )}
                            <span className="text-xs font-medium text-[#37352F] opacity-40 uppercase">分镜 {index + 1}</span>
                        </div>
                        {isEditing && (
                            <button onClick={() => removeScene(index)} className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="notion-card p-5 hover:shadow-[rgba(15,15,15,0.1)_0px_5px_10px] transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        {/* Visual */}
                        <div>
                            <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">画面 (Visual)</span>
                            {isEditing ? (
                                <textarea 
                                    value={scene.visual}
                                    onChange={(e) => handleSceneChange(index, 'visual', e.target.value)}
                                    className="w-full h-20 text-sm p-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none"
                                />
                            ) : (
                                <p className="text-[#37352F] leading-relaxed">{scene.visual}</p>
                            )}
                        </div>
                        
                        {/* Audio */}
                        <div>
                            <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">音效 (Audio)</span>
                            {isEditing ? (
                                <textarea 
                                    value={scene.audio}
                                    onChange={(e) => handleSceneChange(index, 'audio', e.target.value)}
                                    className="w-full h-20 text-sm p-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none"
                                />
                            ) : (
                                <p className="text-[#37352F] opacity-80 leading-relaxed italic">"{scene.audio}"</p>
                            )}
                        </div>
                        
                        {/* Interaction */}
                        <div className="md:col-span-2 bg-[#F7F7F5] p-2.5 rounded-sm border border-[#E9E9E7]">
                            <span className="block text-[10px] text-[#37352F] opacity-50 font-bold uppercase mb-1">交互指令</span>
                            {isEditing ? (
                                <input 
                                    value={scene.interaction || ''}
                                    onChange={(e) => handleSceneChange(index, 'interaction', e.target.value)}
                                    className="w-full text-sm bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                                />
                            ) : (
                                <p className="text-[#37352F] font-medium">{scene.interaction}</p>
                            )}
                        </div>
                        
                        {/* Text */}
                        <div className="md:col-span-2">
                            <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">文案 (Text Overlay)</span>
                            {isEditing ? (
                                <input 
                                    value={scene.text || ''}
                                    onChange={(e) => handleSceneChange(index, 'text', e.target.value)}
                                    className="w-full text-lg font-serif pl-3 border-l-2 border-[#37352F] py-0.5 focus:bg-gray-50 outline-none"
                                />
                            ) : (
                                <p className="text-[#37352F] font-serif text-lg pl-3 border-l-2 border-[#37352F] py-0.5">{scene.text}</p>
                            )}
                        </div>

                        {/* Prompt */}
                        <div className="md:col-span-2 bg-gray-50 p-2.5 rounded-sm border border-gray-200 mt-2">
                            <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1">生成提示词 (Prompt)</span>
                            {isEditing ? (
                                <textarea 
                                    value={scene.prompt || ''}
                                    onChange={(e) => handleSceneChange(index, 'prompt', e.target.value)}
                                    className="w-full h-16 font-mono text-xs p-2 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none"
                                />
                            ) : (
                                <p className="text-gray-600 font-mono text-xs select-all">{scene.prompt}</p>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
            </>
          ) : (
            <div className="overflow-x-auto border border-[#E9E9E7] rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-12 sticky left-0 bg-gray-50 z-10">#</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider w-24">时长</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">画面 (Visual)</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">音效 (Audio)</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">交互</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">文案</th>
                            <th className="px-3 py-3 text-left font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Prompt</th>
                            {isEditing && <th className="px-3 py-3 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {script_content?.map((scene: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-3 font-medium text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-10 align-top">
                                    {index + 1}
                                </td>
                                <td className="px-3 py-3 text-gray-500 font-mono align-top">
                                    {isEditing ? (
                                        <input 
                                            value={scene.time}
                                            onChange={(e) => handleSceneChange(index, 'time', e.target.value)}
                                            className="w-full border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                                        />
                                    ) : scene.time}
                                </td>
                                <td className="px-3 py-3 text-gray-900 align-top">
                                    {isEditing ? (
                                        <textarea 
                                            value={scene.visual}
                                            onChange={(e) => handleSceneChange(index, 'visual', e.target.value)}
                                            className="w-full h-24 p-1 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-xs"
                                        />
                                    ) : (
                                        <div className="line-clamp-6">{scene.visual}</div>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-gray-500 italic align-top">
                                    {isEditing ? (
                                        <textarea 
                                            value={scene.audio}
                                            onChange={(e) => handleSceneChange(index, 'audio', e.target.value)}
                                            className="w-full h-24 p-1 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-xs"
                                        />
                                    ) : (
                                        <div className="line-clamp-6">"{scene.audio}"</div>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-gray-700 align-top">
                                    {isEditing ? (
                                        <textarea 
                                            value={scene.interaction || ''}
                                            onChange={(e) => handleSceneChange(index, 'interaction', e.target.value)}
                                            className="w-full h-24 p-1 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-xs"
                                        />
                                    ) : (
                                        <div className="line-clamp-6">{scene.interaction}</div>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-gray-900 font-serif border-l-2 border-gray-100 pl-3 align-top">
                                    {isEditing ? (
                                        <textarea 
                                            value={scene.text || ''}
                                            onChange={(e) => handleSceneChange(index, 'text', e.target.value)}
                                            className="w-full h-24 p-1 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-xs font-sans"
                                        />
                                    ) : (
                                        <div className="line-clamp-6">{scene.text}</div>
                                    )}
                                </td>
                                <td className="px-3 py-3 text-gray-400 font-mono text-[10px] align-top">
                                    {isEditing ? (
                                        <textarea 
                                            value={scene.prompt || ''}
                                            onChange={(e) => handleSceneChange(index, 'prompt', e.target.value)}
                                            className="w-full h-24 p-1 border border-gray-200 rounded focus:border-blue-500 outline-none resize-none text-[10px]"
                                        />
                                    ) : (
                                        <div className="line-clamp-6 select-all cursor-text">{scene.prompt}</div>
                                    )}
                                </td>
                                {isEditing && (
                                    <td className="px-3 py-3 text-right align-top">
                                        <button onClick={() => removeScene(index)} className="text-gray-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
          
          {isEditing && (
              <button 
                onClick={addScene}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center font-medium"
              >
                  <Plus className="w-5 h-5 mr-2" />
                  添加分镜 (Add Scene)
              </button>
          )}
        </div>
      </div>
    </div>
  );
}