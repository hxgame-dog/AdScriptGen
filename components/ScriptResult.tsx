import { Save, Copy, Check, FileText, Download, Edit3, Plus, Trash2, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScriptResultProps {
  script: any;
  onSave: (updatedScript?: any) => void;
  onScriptChange?: (updatedScript: any) => void;
  saving: boolean;
  streamingContent?: string;
  isNew?: boolean; // If true, start in edit mode
}

export default function ScriptResult({ script, onSave, onScriptChange, saving, streamingContent, isNew }: ScriptResultProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableScript, setEditableScript] = useState<any>(null);

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
    return (
        <div className="bg-[var(--surface)] h-full flex flex-col p-8 overflow-hidden">
            <div className="flex items-center space-x-3 mb-6 animate-pulse">
                <div className="w-2.5 h-2.5 bg-[var(--accent)] rounded-sm"></div>
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest font-mono">Processing Script...</span>
            </div>
            <div className="flex-1 overflow-y-auto bg-[var(--bg-color)] p-6 rounded-[var(--radius)] border border-[var(--border)] font-mono text-xs text-[var(--muted)] whitespace-pre-wrap custom-scrollbar shadow-inner">
                {streamingContent}
                <span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 align-middle animate-pulse"></span>
            </div>
        </div>
    );
  }

  if (!script) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--muted)] opacity-60 bg-[var(--surface)] rounded-[var(--radius)]">
        <div className="w-20 h-20 bg-[var(--bg-color)] rounded-full flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
          <FileText className="w-8 h-8 text-[var(--muted)] opacity-50" />
        </div>
        <p className="text-lg font-bold tracking-tight text-[var(--foreground)]">No Script Generated</p>
        <p className="text-xs mt-2 uppercase tracking-wider opacity-60 font-mono">Configure & Generate to start</p>
      </div>
    );
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(script, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHTML = () => {
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
        if (confirm("放弃新建脚本?")) {
             setEditableScript(script); 
             setIsEditing(false);
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
    <div className="bg-[var(--surface)] h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)] sticky top-0 z-10">
        {/* Left Side: Status / Title Input */}
        <div className="flex flex-col space-y-2 flex-1 mr-6">
            <div className="flex items-center space-x-3">
                {isEditing ? (
                    <input 
                        value={editableScript.title || ''}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        className="text-lg font-bold text-[var(--foreground)] border-b-2 border-[var(--border)] focus:border-[var(--accent)] outline-none w-full max-w-md bg-transparent transition-colors font-mono"
                        placeholder="SCRIPT_TITLE..."
                    />
                ) : (
                    <>
                        <span className="px-2 py-0.5 bg-[var(--bg-color)] text-[var(--muted)] text-[10px] uppercase tracking-wider rounded-[4px] border border-[var(--border)] font-bold">
                            {isNew ? 'DRAFT' : 'GENERATED'}
                        </span>
                        <span className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                            {script.title || 'Untitled Script'}
                        </span>
                        <span className="text-xs text-[var(--muted)] font-mono opacity-60">
                            • {script_content?.length || 0} Scenes
                        </span>
                    </>
                )}
            </div>
            {!isEditing && tags.length > 0 && (
                <div className="flex space-x-1">
                    {tags.map((tag: string, i: number) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-[4px] font-medium border uppercase tracking-wider ${TAG_COLORS[i % TAG_COLORS.length].replace('bg-', 'bg-opacity-10 bg-').replace('border-', 'border-opacity-20 border-')}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex space-x-2">
          {!isEditing ? (
              <>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="notion-button notion-button-secondary flex items-center"
                >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                </button>
                <button 
                    onClick={handleExportHTML}
                    className="notion-button notion-button-secondary flex items-center"
                    title="Export HTML"
                >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export
                </button>
                <button 
                    onClick={handleCopy}
                    className="notion-button notion-button-secondary flex items-center"
                    title="Copy JSON"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
              </>
          ) : (
              <button 
                  onClick={cancelEdits}
                  className="notion-button notion-button-secondary flex items-center text-red-600 hover:bg-red-50 hover:border-red-200"
              >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
              </button>
          )}

          <button 
            onClick={isEditing ? saveEdits : () => onSave(script)}
            disabled={saving}
            className="notion-button notion-button-primary flex items-center shadow-md"
          >
            {isEditing ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {isEditing ? 'Finish Editing' : (saving ? 'Saving...' : 'Save Script')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--surface)]">
        {/* Meta Analysis */}
        <div className="mb-8 p-6 bg-[var(--bg-color)] rounded-[var(--radius)] border border-[var(--border)]">
            <h3 className="text-[11px] font-bold text-[var(--muted)] opacity-80 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full mr-2"></span>
                Strategic Analysis
            </h3>
            {isEditing ? (
                <textarea 
                    value={meta_analysis || ''}
                    onChange={(e) => handleEditChange('meta_analysis', e.target.value)}
                    className="w-full h-32 text-sm p-3 border border-[var(--border)] rounded-[var(--radius)] focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none bg-white font-sans leading-relaxed"
                    placeholder="Enter analysis..."
                />
            ) : (
                <p className="text-[var(--foreground)] text-sm leading-relaxed font-sans">{meta_analysis}</p>
            )}
        </div>

        {/* Production Guide */}
        <div className="mb-10 p-6 bg-[#EFF6FF] rounded-[var(--radius)] border border-blue-100">
            <h3 className="text-[11px] font-bold text-blue-600 opacity-80 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                Production Guide
            </h3>
            {isEditing ? (
                <textarea 
                    value={production_guide || ''}
                    onChange={(e) => handleEditChange('production_guide', e.target.value)}
                    className="w-full h-32 text-sm p-3 border border-blue-200 rounded-[var(--radius)] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-sans leading-relaxed"
                    placeholder="Enter production guide..."
                />
            ) : (
                <div className="text-[#1e3a8a] text-sm leading-relaxed whitespace-pre-wrap font-sans">{production_guide}</div>
            )}
        </div>

        {/* Script Content */}
        <div className="space-y-12">
          {script_content?.map((scene: any, index: number) => (
            <div key={index} className="group relative pl-6 border-l-2 border-[var(--border)] hover:border-[var(--accent)] transition-colors duration-300">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-baseline">
                    {isEditing ? (
                        <input 
                            value={scene.time}
                            onChange={(e) => handleSceneChange(index, 'time', e.target.value)}
                            className="text-lg font-bold text-[var(--foreground)] mr-3 font-mono border-b border-[var(--border)] w-24 focus:border-[var(--accent)] outline-none bg-transparent"
                        />
                    ) : (
                        <span className="text-lg font-bold text-[var(--foreground)] mr-3 font-mono">{scene.time}</span>
                    )}
                    <span className="text-xs font-bold text-[var(--muted)] opacity-50 uppercase tracking-wider">Scene {index + 1}</span>
                </div>
                {isEditing && (
                    <button onClick={() => removeScene(index)} className="text-[var(--muted)] hover:text-red-600 p-1 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
              </div>
              
              <div className="bg-white border border-[var(--border)] rounded-[var(--radius)] p-6 shadow-sm hover:shadow-md transition-shadow group-hover:border-[var(--accent)] duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                  {/* Visual */}
                  <div>
                    <span className="block text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-2">Visual</span>
                    {isEditing ? (
                        <textarea 
                            value={scene.visual}
                            onChange={(e) => handleSceneChange(index, 'visual', e.target.value)}
                            className="w-full h-24 text-sm p-3 border border-[var(--border)] rounded-[var(--radius)] focus:border-[var(--accent)] outline-none resize-none bg-[var(--bg-color)]"
                        />
                    ) : (
                        <p className="text-[var(--foreground)] leading-relaxed font-sans">{scene.visual}</p>
                    )}
                  </div>
                  
                  {/* Audio */}
                  <div>
                    <span className="block text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-2">Audio</span>
                    {isEditing ? (
                        <textarea 
                            value={scene.audio}
                            onChange={(e) => handleSceneChange(index, 'audio', e.target.value)}
                            className="w-full h-24 text-sm p-3 border border-[var(--border)] rounded-[var(--radius)] focus:border-[var(--accent)] outline-none resize-none bg-[var(--bg-color)]"
                        />
                    ) : (
                        <p className="text-[var(--muted)] leading-relaxed italic font-serif">"{scene.audio}"</p>
                    )}
                  </div>
                  
                  {/* Interaction */}
                  <div className="md:col-span-2 bg-[var(--bg-color)] p-4 rounded-[var(--radius)] border border-[var(--border)] flex items-start">
                      <div className="mr-3 mt-0.5">
                        <span className="block w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                      </div>
                      <div className="flex-1">
                        <span className="block text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-1">Interaction</span>
                        {isEditing ? (
                            <input 
                                value={scene.interaction || ''}
                                onChange={(e) => handleSceneChange(index, 'interaction', e.target.value)}
                                className="w-full text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] outline-none font-medium"
                            />
                        ) : (
                            <p className="text-[var(--foreground)] font-medium">{scene.interaction}</p>
                        )}
                      </div>
                  </div>
                  
                  {/* Text */}
                  <div className="md:col-span-2">
                      <span className="block text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-2">Copy / Text Overlay</span>
                      {isEditing ? (
                          <input 
                              value={scene.text || ''}
                              onChange={(e) => handleSceneChange(index, 'text', e.target.value)}
                              className="w-full text-xl font-serif pl-4 border-l-4 border-[var(--foreground)] py-1 focus:bg-[var(--bg-color)] outline-none"
                          />
                      ) : (
                          <p className="text-[var(--foreground)] font-serif text-xl pl-4 border-l-4 border-[var(--foreground)] py-1 italic leading-relaxed">{scene.text}</p>
                      )}
                  </div>

                  {/* Prompt */}
                  <div className="md:col-span-2 bg-gray-50 p-4 rounded-[var(--radius)] border border-gray-200 mt-2">
                      <span className="block text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-2 flex justify-between">
                          <span>AI Image Prompt</span>
                          <span className="text-[9px] bg-white px-1 border rounded text-gray-400">Midjourney / SD</span>
                      </span>
                      {isEditing ? (
                          <textarea 
                              value={scene.prompt || ''}
                              onChange={(e) => handleSceneChange(index, 'prompt', e.target.value)}
                              className="w-full h-20 font-mono text-xs p-2 border border-[var(--border)] rounded-[var(--radius)] focus:border-[var(--accent)] outline-none resize-none bg-white"
                          />
                      ) : (
                          <p className="text-gray-600 font-mono text-xs select-all break-all leading-relaxed bg-white p-2 rounded border border-gray-100">{scene.prompt}</p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isEditing && (
              <button 
                onClick={addScene}
                className="w-full py-6 border-2 border-dashed border-[var(--border)] rounded-[var(--radius)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-all flex items-center justify-center font-bold uppercase tracking-wider text-xs"
              >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Scene
              </button>
          )}
        </div>
      </div>
    </div>
  );
}