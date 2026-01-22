import { Save, Copy, Check, FileText, Download } from 'lucide-react';
import { useState } from 'react';

interface ScriptResultProps {
  script: any;
  onSave: () => void;
  saving: boolean;
  streamingContent?: string;
}

export default function ScriptResult({ script, onSave, saving, streamingContent }: ScriptResultProps) {
  const [copied, setCopied] = useState(false);

  // Show streaming content if available and script is not yet parsed
  if (streamingContent && !script) {
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
      <div className="h-full flex flex-col items-center justify-center text-[#37352F] opacity-40 bg-white rounded-sm">
        <div className="w-16 h-16 bg-[#F7F7F5] rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[#9B9A97]" />
        </div>
        <p className="text-lg font-medium">暂无脚本生成</p>
        <p className="text-sm mt-1">请在左侧配置参数并点击生成</p>
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

  const { meta_analysis, script_content } = script;

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#E9E9E7] flex justify-between items-center bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <span className="px-2 py-0.5 bg-[#E3E2E0] text-[#37352F] text-xs rounded-sm font-medium">
             已生成
          </span>
          <span className="text-sm text-[#37352F] opacity-60 font-medium">
             {script_content?.length || 0} 个分镜
          </span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportHTML}
            className="notion-button notion-button-secondary flex items-center"
            title="导出 HTML"
          >
            <Download className="w-4 h-4 mr-1" />
            导出 HTML
          </button>
          <button 
            onClick={handleCopy}
            className="notion-button notion-button-secondary flex items-center"
            title="复制 JSON"
          >
            {copied ? <Check className="w-4 h-4 text-green-600 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制 JSON'}
          </button>
          <button 
            onClick={onSave}
            disabled={saving}
            className="notion-button notion-button-primary flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? '保存中...' : '保存脚本'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {meta_analysis && (
          <div className="mb-8 p-4 bg-[#F7F7F5] rounded-sm border border-[#E9E9E7]">
            <h3 className="text-xs font-semibold text-[#37352F] opacity-60 uppercase tracking-widest mb-2">策略分析</h3>
            <p className="text-[#37352F] text-sm leading-relaxed">
              {meta_analysis}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {script_content?.map((scene: any, index: number) => (
            <div key={index} className="group relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E9E9E7] group-hover:bg-[#2383E2] transition-colors"></div>
              
              <div className="mb-2 flex items-baseline">
                <span className="text-base font-bold text-[#37352F] mr-3 font-mono">{scene.time}</span>
                <span className="text-xs font-medium text-[#37352F] opacity-40 uppercase">分镜 {index + 1}</span>
              </div>
              
              <div className="notion-card p-5 hover:shadow-[rgba(15,15,15,0.1)_0px_5px_10px] transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">画面 (Visual)</span>
                    <p className="text-[#37352F] leading-relaxed">{scene.visual}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">音效 (Audio)</span>
                    <p className="text-[#37352F] opacity-80 leading-relaxed italic">"{scene.audio}"</p>
                  </div>
                  {scene.interaction && (
                    <div className="md:col-span-2 bg-[#F7F7F5] p-2.5 rounded-sm border border-[#E9E9E7]">
                      <span className="block text-[10px] text-[#37352F] opacity-50 font-bold uppercase mb-1">交互指令</span>
                      <p className="text-[#37352F] font-medium">{scene.interaction}</p>
                    </div>
                  )}
                  {scene.text && (
                    <div className="md:col-span-2">
                      <span className="block text-[10px] text-[#37352F] opacity-40 font-bold uppercase mb-1.5">文案 (Text Overlay)</span>
                      <p className="text-[#37352F] font-serif text-lg pl-3 border-l-2 border-[#37352F] py-0.5">{scene.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}