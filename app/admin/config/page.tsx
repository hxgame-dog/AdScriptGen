'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowLeft, Settings, PlusCircle } from 'lucide-react';
import Link from 'next/link';

interface FieldConfig {
  id?: string;
  key: string;
  label: string;
  options: string[]; // parsed
}

export default function AdminConfigPage() {
  const [configs, setConfigs] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newConfig, setNewConfig] = useState<FieldConfig>({ key: '', label: '', options: [] });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/configs');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setConfigs(data.map((c: any) => ({
          ...c,
          options: JSON.parse(c.options || '[]')
        })));
        // Select first if none selected
        if (!selectedKey && !isCreating) {
            setSelectedKey(data[0].key);
        }
      } else {
          // Fallback to hardcoded defaults if API returns empty (e.g. Vercel read-only DB)
          // We import these from ConfigPanel or duplicate them here.
          // For simplicity and robustness, let's duplicate the structure to ensure Admin page works visually
          // even if saving fails.
          const DEFAULT_CONFIGS = [
            {
              key: 'visualTheme',
              label: '视觉主题 (Visual Theme)',
              options: [
                "Low-poly (低多边形)",
                "Realistic Cyberpunk (写实赛博朋克)",
                "Toon Shading (卡通渲染)",
                "Pixel Art (像素风)",
                "Vaporwave (蒸汽波)",
                "Ink Wash (水墨风)",
                "Ghibli Style (吉卜力风格)",
                "Neon Noir (霓虹黑色电影)"
              ]
            },
            {
              key: 'cameraAngle',
              label: '运镜视角 (Camera Angle)',
              options: [
                "Third Person Chase (第三人称追尾)",
                "First Person Cockpit (第一人称座舱)",
                "Top-down (上帝视角)",
                "Cinematic Drone (电影级无人机跟随)",
                "Dynamic Action (动态动作捕捉)",
                "Wheel Cam (车轮特写)"
              ]
            },
            {
              key: 'coreInteraction',
              label: '核心交互 (Interaction)',
              options: [
                "One-finger Hold (单指按住)",
                "Gravity / Tilt (重力感应)",
                "Virtual Joystick (虚拟摇杆)",
                "Tap to Drift (点击漂移)",
                "Swipe Gestures (滑动收拾)",
                "Voice Control (语音控制)",
                "Rhythm Tap (节奏点击)"
              ]
            },
            {
              key: 'copyHook',
              label: '文案钩子 (Hook)',
              options: [
                "99% Fail Rate (99%的玩家都会失败)",
                "Only for Pro Drivers (只有老司机能过)",
                "Satisfying Drift (极其解压的漂移)",
                "Can you beat level 1? (你能过第一关吗？)",
                "Noob vs Pro (菜鸟 vs 高手)",
                "Don't Blink (千万别眨眼)"
              ]
            },
            {
              key: 'audioDesign',
              label: '音频设计 (Audio)',
              options: [
                "Phonk Music (Phonk 漂移神曲)",
                "ASMR Engine (ASMR 引擎声)",
                "Intense Rock (激昂摇滚)",
                "Meme Sounds (网络热梗音效)",
                "Voiceover Commentary (解说旁白)",
                "Synthwave (合成波音乐)"
              ]
            },
            {
              key: 'scriptFlow',
              label: '剧本流程 (Flow)',
              options: [
                "High Skill Showcase (高玩炫技流)",
                "Tutorial -> Fail (教学 -> 失败)",
                "Noob vs Pro Contrast (新手高手对比)",
                "Unexpected Chaos (意外的混乱)",
                "Speedrun (极速通关)",
                "Evolution (车辆进化过程)"
              ]
            },
            {
              key: 'ending',
              label: '结尾 (Ending)',
              options: [
                "Fail after High Score (高分后意外失败)",
                "Epic Comeback (极限反杀)",
                "Cliffhanger (悬念结局)",
                "Unlock Secret Car (解锁隐藏车)",
                "Funny Crash (滑稽车祸)",
                "Victory Lap (胜利冲线)"
              ]
            }
        ];
        setConfigs(DEFAULT_CONFIGS);
        if (!selectedKey && !isCreating) {
            setSelectedKey(DEFAULT_CONFIGS[0].key);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (config: FieldConfig) => {
    if (!config.key || !config.label) {
        alert("Key and Label are required");
        return;
    }
    
    // Ensure we are saving the *current* state of options, not stale ones
    // But config passed here is currentConfig which is from render, so it should be fine.
    // However, let's make sure we are not losing focus or state.
    
    try {
      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            key: config.key,
            label: config.label,
            options: config.options
        }),
      });
      
      if (res.ok) {
          const savedConfig = await res.json();
          alert('保存成功');
          
          // Update local state without full refetch to keep UI stable if possible, 
          // but full refetch is safer for sync.
          // Let's refetch to be sure.
          await fetchConfigs();
          
          // If we were creating, switch to editing mode for the new key
          if (isCreating) {
              setIsCreating(false);
              setSelectedKey(savedConfig.key);
              setNewConfig({ key: '', label: '', options: [] });
          }
      } else {
          const errorData = await res.json();
          alert(`保存失败: ${errorData.error || '未知错误'}`);
      }
    } catch (e: any) {
      alert(`保存失败: ${e.message}`);
    }
  };

  const handleDelete = async (key: string) => {
      if (!confirm(`Are you sure you want to delete "${key}"?`)) return;
      try {
          const res = await fetch(`/api/configs?key=${key}`, { method: 'DELETE' });
          if (res.ok) {
              alert('删除成功');
              const remaining = configs.filter(c => c.key !== key);
              if (remaining.length > 0) setSelectedKey(remaining[0].key);
              else setSelectedKey(null);
              fetchConfigs();
          } else {
              alert('删除失败');
          }
      } catch (e) {
          alert('删除出错');
      }
  };

  const startCreate = () => {
      setIsCreating(true);
      setSelectedKey(null);
      setNewConfig({ key: '', label: '', options: [] });
  };

  const currentConfig = isCreating ? newConfig : configs.find(c => c.key === selectedKey);
  const setCurrentConfigState = (updater: (prev: FieldConfig) => FieldConfig) => {
      if (isCreating) {
          setNewConfig(updater(newConfig));
      } else if (selectedKey) {
          setConfigs(prev => prev.map(c => c.key === selectedKey ? updater(c) : c));
      }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans text-[#37352F]">
      <header className="h-14 border-b border-[#E9E9E7] flex items-center px-6 justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#37352F]" />
          </Link>
          <h1 className="text-base font-semibold text-[#37352F]">字段配置管理</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-[#E9E9E7] bg-[#F7F7F5] overflow-y-auto flex flex-col">
          <div className="p-4 flex-1">
             <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs font-semibold text-[#37352F] opacity-60 uppercase tracking-widest">配置项列表</h2>
                <button onClick={startCreate} className="text-[#2383E2] hover:bg-[#EFEFED] p-1 rounded">
                    <PlusCircle className="w-4 h-4" />
                </button>
             </div>
             <div className="space-y-1">
                {configs.map(c => (
                    <div key={c.key} className="flex items-center group">
                        <button
                            onClick={() => { setSelectedKey(c.key); setIsCreating(false); }}
                            className={`flex-1 text-left px-3 py-2 rounded-sm text-sm font-medium transition-colors ${selectedKey === c.key ? 'bg-white shadow-sm text-[#2383E2]' : 'text-[#37352F] hover:bg-[#EFEFED]'}`}
                        >
                            {c.label.split('(')[0]}
                        </button>
                        <button 
                            onClick={() => handleDelete(c.key)}
                            className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="删除"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {isCreating && (
                    <button className="w-full text-left px-3 py-2 rounded-sm text-sm font-medium bg-white shadow-sm text-[#2383E2]">
                        (New Field)
                    </button>
                )}
             </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
            {currentConfig ? (
                <div className="max-w-2xl mx-auto">
                    {isCreating && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-sm">
                            <h3 className="text-sm font-bold text-blue-800 mb-2">新建字段</h3>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#37352F] mb-1">Key (唯一标识, 英文)</label>
                                <input 
                                    value={currentConfig.key}
                                    onChange={(e) => setCurrentConfigState(prev => ({ ...prev, key: e.target.value }))}
                                    className="notion-input w-full"
                                    placeholder="e.g. musicStyle"
                                />
                            </div>
                        </div>
                    )}

                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-[#37352F] mb-2">字段名称 (Label)</label>
                        <input 
                            value={currentConfig.label}
                            onChange={(e) => setCurrentConfigState(prev => ({ ...prev, label: e.target.value }))}
                            className="notion-input w-full"
                            placeholder="e.g. 音乐风格 (Music Style)"
                        />
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-[#37352F]">选项列表 (Options)</label>
                            <button 
                                onClick={() => setCurrentConfigState(prev => ({ ...prev, options: [...prev.options, 'New Option'] }))}
                                className="text-xs flex items-center text-[#2383E2] hover:underline"
                            >
                                <Plus className="w-3 h-3 mr-1" /> 添加选项
                            </button>
                        </div>
                        <div className="space-y-2">
                            {currentConfig.options.map((opt, idx) => (
                                <div key={idx} className="flex items-center space-x-2 group">
                                    <input 
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...currentConfig.options];
                                            newOptions[idx] = e.target.value;
                                            setCurrentConfigState(prev => ({ ...prev, options: newOptions }));
                                        }}
                                        className="notion-input flex-1"
                                    />
                                    <button 
                                        onClick={() => {
                                            const newOptions = currentConfig.options.filter((_, i) => i !== idx);
                                            setCurrentConfigState(prev => ({ ...prev, options: newOptions }));
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#E9E9E7]">
                        <button 
                            onClick={() => handleSave(currentConfig)}
                            className="notion-button notion-button-primary flex items-center px-6"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            保存配置
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Settings className="w-12 h-12 mb-4 opacity-20" />
                    <p>请选择左侧配置项或点击 + 新建</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
