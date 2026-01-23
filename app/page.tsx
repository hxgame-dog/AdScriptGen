'use client';

import { useState, useEffect } from 'react';
import ConfigPanel from '@/components/ConfigPanel';
import ScriptResult from '@/components/ScriptResult';
import HistoryList from '@/components/HistoryList';
import Link from 'next/link';
import { User, Film, HelpCircle } from 'lucide-react';

export default function Home() {
  const [models, setModels] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [currentScript, setCurrentScript] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  
  // Rename Modal State
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);

  const [username, setUsername] = useState('Anonymous');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // Fetch models and scripts on mount
  useEffect(() => {
    // Load username
    const storedUser = localStorage.getItem('adscript_username');
    if (storedUser) setUsername(storedUser);
    else {
        // Prompt for username if not set
        setShowUserModal(true);
    }

    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setModels(data);
      })
      .catch(err => console.error("Failed to load models", err));

    fetchScripts();
  }, []);

  const handleSaveUser = () => {
      if (newUsername.trim()) {
          setUsername(newUsername);
          localStorage.setItem('adscript_username', newUsername);
          setShowUserModal(false);
      }
  };

  const fetchScripts = () => {
    // Fetch from API first
    fetch('/api/scripts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
            // Also load from LocalStorage and merge
            const localHistory = JSON.parse(localStorage.getItem('adscript_history') || '[]');
            // Merge by ID, prefer API if duplicates (or just show all)
            // For simplicity, let's just use what we have. 
            // If API works, we use API. If API returns empty but we have local, maybe user is on Vercel.
            
            // Actually, if we are in a hybrid mode where API might fail (Vercel), 
            // we should probably prioritize LocalStorage if API returns empty array but LocalStorage has data?
            // Or just concat them? 
            // Let's concat unique items.
            const apiIds = new Set(data.map((s: any) => s.id));
            const uniqueLocal = localHistory.filter((s: any) => !apiIds.has(s.id));
            
            setScripts([...data, ...uniqueLocal].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      })
      .catch(err => {
          console.error("Failed to load history from API", err);
          // Fallback to LocalStorage
          const localHistory = JSON.parse(localStorage.getItem('adscript_history') || '[]');
          setScripts(localHistory);
      });
  };

  const handleGenerate = async (params: any) => {
    setLoading(true);
    setCurrentScript(null); // Clear previous
    setStreamingContent(''); // Clear previous stream
    
    try {
      // Structure the request body to match API expectation
      const { apiKey, model, ...restParams } = params;
      const requestBody = {
        apiKey,
        model,
        parameters: restParams
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成失败');
      }

      // Handle Streaming
      if (!res.body) throw new Error('No response body');
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullText = '';

      while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk;
              setStreamingContent(prev => prev + chunk);
          }
      }

      // Try to parse the full JSON
      // Sometimes Gemini wraps JSON in ```json ... ```
      let jsonStr = fullText;
      if (fullText.includes('```json')) {
          jsonStr = fullText.split('```json')[1].split('```')[0];
      } else if (fullText.includes('```')) {
          jsonStr = fullText.split('```')[1].split('```')[0];
      }
      
      let data;
      try {
        data = JSON.parse(jsonStr);
      } catch (e) {
        console.error("JSON Parse Error", e);
        console.log("Raw text:", fullText); // Debugging
        // Try to recover using regex
        const match = fullText.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                data = JSON.parse(match[0]);
            } catch(e2) {
                throw new Error('生成的脚本格式有误，请重试');
            }
        } else {
            throw new Error('生成的脚本格式有误，请重试');
        }
      }

      // Check for required fields
      if (!data.script_content || !Array.isArray(data.script_content)) {
          // Sometimes AI puts it inside 'structure' or other keys
          if (data.structure && data.structure.script_content) {
              data = data.structure;
          } else if (data.content && data.content.script_content) {
              data = data.content;
          } else {
             // Try to find any array that looks like script content
             const possibleArray = Object.values(data).find(val => Array.isArray(val) && val.length > 0 && (val[0] as any).visual);
             if (possibleArray) {
                 data.script_content = possibleArray;
             }
          }
      }

      // Construct a full script object including parameters for saving later
      // safeParams should be the actual parameters used for generation
      const safeParams = restParams;
      
      const newScript = {
          ...data,
          parameters: safeParams, // Save params object without API key
          modelUsed: params.model,
          title: `${params.gameName} - ${params.visualTheme} - ${params.scriptFlow?.split('(')[0].trim() || '脚本'}`
      };
      
      setCurrentScript(newScript);
      setStreamingContent(''); // Clear stream once parsed successfully

    } catch (err: any) {
      alert(err.message || '生成失败');
      // Keep streaming content visible if it failed to parse, so user can at least see the raw output
      if (streamingContent) {
          // Do not clear streaming content on error so user can see what happened
      } else {
          setStreamingContent(''); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = () => {
    if (!currentScript) return;
    setSaveTitle(currentScript.title || "未命名脚本");
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (!currentScript) return;
    
    setSaving(true);
    let savedScript: any = null;

    // 1. Always save to LocalStorage first (as a reliable backup/cache)
    try {
        const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
        
        // Generate a temporary ID for LS (will be overwritten by API ID if API succeeds, or used as is)
        const tempId = Date.now().toString();
        
        const newHistoryItem = {
            id: tempId,
            title: saveTitle || currentScript.title,
            parameters: typeof currentScript.parameters === 'string' ? currentScript.parameters : JSON.stringify(currentScript.parameters),
            content: typeof currentScript.content === 'string' ? currentScript.content: JSON.stringify({
                    meta_analysis: currentScript.meta_analysis,
                    script_content: currentScript.script_content
                }),
                modelUsed: currentScript.modelUsed,
                creator: username,
                createdAt: new Date().toISOString()
            };

        // We save it temporarily. If API succeeds, we might want to update the ID, but for now this ensures data safety.
        // Actually, let's wait for API response. If API fails, we use this. 
        // If API succeeds, we use the API's returned object (which has the real DB ID).
        // But to be super safe against ephemeral API (Cloudflare), we should save to LS anyway.
        
        savedScript = newHistoryItem;
    } catch (e) {
        console.error("LS Pre-save failed", e);
    }

    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveTitle || currentScript.title,
          parameters: currentScript.parameters,
          content: { 
            meta_analysis: currentScript.meta_analysis, 
            script_content: currentScript.script_content 
          },
          modelUsed: currentScript.modelUsed,
          creator: username,
        }),
      });
      
      if (res.ok) {
        const apiData = await res.json();
        // API Saved successfully. Use the ID from API.
        if (savedScript) {
            savedScript.id = apiData.id; // Update ID to match DB
            // Update other fields if API normalized them
            savedScript.createdAt = apiData.createdAt; 
        } else {
             // Fallback if LS pre-save failed
             savedScript = {
                ...apiData,
                parameters: typeof apiData.parameters === 'string' ? apiData.parameters : JSON.stringify(apiData.parameters),
                content: typeof apiData.content === 'string' ? apiData.content : JSON.stringify(apiData.content),
            };
        }
        
        fetchScripts(); // Reload from API to get any other updates
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
       console.warn("API Save failed, relying on LocalStorage", err);
       // If API failed, we keep the tempId in savedScript
    } finally {
        // Finalize LocalStorage Save
        if (savedScript) {
            try {
                const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
                // Check if we already have this ID (unlikely unless UUID collision or race condition)
                // Filter out if we are updating? No, this is create.
                localStorage.setItem('adscript_history', JSON.stringify([savedScript, ...savedScripts]));
                
                // Update State
                setScripts(prev => {
                    // Avoid duplicates if fetchScripts already grabbed it from API
                    if (prev.find(s => s.id === savedScript.id)) return prev;
                    return [savedScript, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                });
            } catch (lsErr) {
                alert('保存失败 (本地存储不可用)');
            }
        }
        setSaving(false);
        setShowSaveModal(false);
    }
  };

  const handleHistorySelect = (script: any) => {
    let parsedContent = script.content;
    if (typeof script.content === 'string') {
        try {
            parsedContent = JSON.parse(script.content);
        } catch(e) { console.error("Parse error content", e); }
    }
    
    let parsedParams = script.parameters;
    if (typeof script.parameters === 'string') {
        try {
            parsedParams = JSON.parse(script.parameters);
        } catch(e) { console.error("Parse error params", e); }
    }

    setCurrentScript({
        ...script, // id, title, modelUsed, createdAt
        ...parsedContent, // meta_analysis, script_content
        parameters: parsedParams
    });
  };

  const handleHistoryDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
        const res = await fetch(`/api/scripts?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchScripts();
            if (currentScript?.id === id) setCurrentScript(null);
        } else {
             // Try deleting from LocalStorage if API failed
             const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
             const newScripts = savedScripts.filter((s: any) => s.id !== id);
             localStorage.setItem('adscript_history', JSON.stringify(newScripts));
             setScripts(prev => prev.filter(s => s.id !== id));
             if (currentScript?.id === id) setCurrentScript(null);
        }
    } catch (e) {
        // Try deleting from LocalStorage on error
         const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
         const newScripts = savedScripts.filter((s: any) => s.id !== id);
         localStorage.setItem('adscript_history', JSON.stringify(newScripts));
         setScripts(prev => prev.filter(s => s.id !== id));
         if (currentScript?.id === id) setCurrentScript(null);
    }
  };

  const handleHistoryRename = (id: string, currentTitle: string) => {
      setRenameId(id);
      setRenameTitle(currentTitle);
      setShowRenameModal(true);
  };

  const handleConfirmRename = async () => {
      if (!renameId || !renameTitle) return;
      const id = renameId;
      const newTitle = renameTitle;
      
      try {
          const res = await fetch('/api/scripts', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, title: newTitle })
          });
          if (res.ok) {
              fetchScripts();
              if (currentScript?.id === id) {
                  setCurrentScript((prev: any) => ({ ...prev, title: newTitle }));
              }
          } else {
               // Try rename in LocalStorage
               const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
               const updatedScripts = savedScripts.map((s: any) => s.id === id ? { ...s, title: newTitle } : s);
               localStorage.setItem('adscript_history', JSON.stringify(updatedScripts));
               setScripts(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
               if (currentScript?.id === id) {
                  setCurrentScript((prev: any) => ({ ...prev, title: newTitle }));
               }
          }
      } catch (e) {
           // Try rename in LocalStorage on error
           const savedScripts = JSON.parse(localStorage.getItem('adscript_history') || '[]');
           const updatedScripts = savedScripts.map((s: any) => s.id === id ? { ...s, title: newTitle } : s);
           localStorage.setItem('adscript_history', JSON.stringify(updatedScripts));
           setScripts(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
           if (currentScript?.id === id) {
              setCurrentScript((prev: any) => ({ ...prev, title: newTitle }));
           }
      } finally {
          setShowRenameModal(false);
          setRenameId(null);
          setRenameTitle('');
      }
  };

  return (
    <main className="min-h-screen bg-white font-sans text-[#37352F] flex flex-col h-screen overflow-hidden">
      <header className="h-12 border-b border-[#E9E9E7] flex items-center px-4 justify-between flex-shrink-0 bg-white z-20">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-[#37352F] text-white flex items-center justify-center rounded-sm text-xs font-bold">A</div>
          <h1 className="text-sm font-medium tracking-tight text-[#37352F]">AdScriptGen</h1>
          <span className="text-[#E9E9E7]">/</span>
          <p className="text-xs text-[#37352F] opacity-60">AI 赛车游戏广告素材生成器</p>
          <div className="ml-4 flex items-center space-x-2">
             <Link href="/production" className="text-xs flex items-center px-2 py-1 hover:bg-[#F7F7F5] rounded text-[#37352F] opacity-80 hover:opacity-100 transition-opacity">
                <Film className="w-3 h-3 mr-1" />
                制作管理
             </Link>
             <Link href="/help" className="text-xs flex items-center px-2 py-1 hover:bg-[#F7F7F5] rounded text-[#37352F] opacity-80 hover:opacity-100 transition-opacity">
                <HelpCircle className="w-3 h-3 mr-1" />
                使用说明
             </Link>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <button 
                onClick={() => { setNewUsername(username); setShowUserModal(true); }}
                className="flex items-center space-x-1.5 px-2 py-1 hover:bg-[#F7F7F5] rounded cursor-pointer group"
           >
                <div className="w-5 h-5 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[10px] text-[#37352F] border border-[#E9E9E7] group-hover:bg-white">
                    <User className="w-3 h-3" />
                </div>
                <span className="text-xs text-[#37352F] font-medium">{username}</span>
           </button>
           <span className="text-[10px] text-[#37352F] opacity-40 px-1.5 py-0.5 rounded border border-[#E9E9E7]">v1.1.0</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Config */}
        <div className="w-[300px] flex-shrink-0 h-full min-h-0">
          <ConfigPanel 
            onGenerate={handleGenerate} 
            loading={loading} 
            models={models} 
          />
        </div>

        {/* Middle Column: Result */}
        <div className="flex-1 h-full min-h-0 relative">
          <ScriptResult 
            script={currentScript} 
            onSave={handleSaveClick} 
            saving={saving}
            streamingContent={streamingContent}
          />
        </div>

        {/* Right Column: History */}
        <div className="w-[260px] flex-shrink-0 h-full min-h-0">
          <HistoryList 
            scripts={scripts} 
            onSelect={handleHistorySelect} 
            onDelete={handleHistoryDelete}
            onRename={handleHistoryRename}
          />
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-[400px] border border-[#E9E9E7] p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-[#37352F] mb-4">设置用户名</h3>
            <p className="text-xs text-[#37352F] opacity-60 mb-4">请输入您的名字，以便在多人协作中识别您的身份。</p>
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">用户名 / 昵称</label>
              <input 
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="notion-input w-full"
                placeholder="例如: Alice"
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUser();
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleSaveUser}
                disabled={!newUsername.trim()}
                className="notion-button notion-button-primary"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-[400px] border border-[#E9E9E7] p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-[#37352F] mb-4">保存脚本</h3>
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">标题</label>
              <input 
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="notion-input w-full"
                placeholder="输入脚本标题..."
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="notion-button hover:bg-[#EFEFED] text-[#37352F]"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmSave}
                disabled={saving}
                className="notion-button notion-button-primary"
              >
                {saving ? '保存中...' : '确认保存'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-[400px] border border-[#E9E9E7] p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-[#37352F] mb-4">重命名脚本</h3>
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">新标题</label>
              <input 
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                className="notion-input w-full"
                placeholder="输入新标题..."
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmRename();
                    if (e.key === 'Escape') setShowRenameModal(false);
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowRenameModal(false)}
                className="notion-button hover:bg-[#EFEFED] text-[#37352F]"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmRename}
                className="notion-button notion-button-primary"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
