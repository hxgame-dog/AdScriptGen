import { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles, Settings2, Edit } from 'lucide-react';
import Link from 'next/link';

interface ConfigPanelProps {
  onGenerate: (params: any) => void;
  loading: boolean;
  models: { name: string; displayName: string }[];
  onCreateCustom: (params?: any) => void;
  onGameNamesChange?: (names: string[]) => void;
}

interface FieldOption {
    key: string;
    label: string;
    options: string[];
}

const DEFAULT_CONFIGS: FieldOption[] = [
    {
      key: 'gameName',
      label: '游戏名称 (Game Name)',
      options: [
        "Drift Racing: 3v3",
        "Speed Legend",
        "Kart Rider Rush",
        "Asphalt 9"
      ]
    },
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

export default function ConfigPanel({ onGenerate, loading, models: initialModels, onCreateCustom }: ConfigPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState(initialModels);
  const [loadingModels, setLoadingModels] = useState(false);
  const [fieldConfigs, setFieldConfigs] = useState<FieldOption[]>(DEFAULT_CONFIGS);
  
  const [params, setParams] = useState({
    model: 'gemini-1.5-flash',
    gameName: DEFAULT_CONFIGS[0].options[0],
    videoDuration: '30',
    visualTheme: DEFAULT_CONFIGS[1].options[0],
    cameraAngle: DEFAULT_CONFIGS[2].options[0],
    coreInteraction: DEFAULT_CONFIGS[3].options[0],
    copyHook: DEFAULT_CONFIGS[4].options[0],
    audioDesign: DEFAULT_CONFIGS[5].options[0],
    scriptFlow: DEFAULT_CONFIGS[6].options[0],
    ending: DEFAULT_CONFIGS[7].options[0],
  });

  // Fetch configs
  useEffect(() => {
      const loadConfigs = async () => {
          // 1. Load from LS first (custom configs)
          const localConfigs = JSON.parse(localStorage.getItem('adscript_field_configs') || '[]');
          
          try {
              const res = await fetch('/api/configs');
              const data = await res.json();
              
              // Start with DEFAULT_CONFIGS to ensure Game Name is present
              let mergedConfigs = [...DEFAULT_CONFIGS];

              if (Array.isArray(data) && data.length > 0) {
                  // If API returns configs, we need to carefully merge or replace.
                  // Since API might not have 'gameName' if it's new, we should prioritize DEFAULT structure but update options if present.
                  // For simplicity in this fix: we'll stick to DEFAULT_CONFIGS + API updates for existing keys.
                  // But wait, the user says "Game Name" disappeared. This means `fieldConfigs` state didn't include it.
                  // This happens if `data` from API completely replaces `DEFAULT_CONFIGS` and `data` is stale (doesn't have gameName).
                  
                  // FIX: We will force 'gameName' to be present by merging API data INTO default configs, not replacing.
                  const apiConfigMap = new Map(data.map((d: any) => [d.key, { ...d, options: JSON.parse(d.options || '[]') }]));
                  
                  mergedConfigs = DEFAULT_CONFIGS.map(def => {
                      if (apiConfigMap.has(def.key)) {
                          return apiConfigMap.get(def.key);
                      }
                      return def;
                  });
              }
              
              // Merge Local Overrides
              if (localConfigs.length > 0) {
                  const configMap = new Map(mergedConfigs.map(c => [c.key, c]));
                  localConfigs.forEach((lc: FieldOption) => {
                      configMap.set(lc.key, lc);
                  });
                  mergedConfigs = Array.from(configMap.values());
              }

              setFieldConfigs(mergedConfigs);
          } catch (err) {
              console.error("Failed to fetch configs, using defaults + local", err);
              // Fallback: Default + Local
              let mergedConfigs = [...DEFAULT_CONFIGS];
              if (localConfigs.length > 0) {
                  const configMap = new Map(mergedConfigs.map(c => [c.key, c]));
                  localConfigs.forEach((lc: FieldOption) => {
                      configMap.set(lc.key, lc);
                  });
                  mergedConfigs = Array.from(configMap.values());
              }
              setFieldConfigs(mergedConfigs);
          }
      };
      
      loadConfigs();
  }, []);
  
  // Notify parent about available game names
  useEffect(() => {
      if (onGameNamesChange) {
          const gameNameConfig = fieldConfigs.find(c => c.key === 'gameName');
          if (gameNameConfig) {
              onGameNamesChange(gameNameConfig.options);
          }
      }
  }, [fieldConfigs, onGameNamesChange]);

  // Fetch models when API key changes (debounced)
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const fetchModels = useCallback(async (key: string) => {
    if (!key) return;
    setLoadingModels(true);
    try {
      const res = await fetch('/api/models', {
        headers: { 'x-google-api-key': key }
      });
      if (!res.ok) {
        throw new Error('Fetch failed');
      }
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setModels(data);
        // If current model is not in list, select the first one
        if (!data.find((m: any) => m.name === params.model)) {
            setParams(prev => ({ ...prev, model: data[0].name }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch models", e);
    } finally {
      setLoadingModels(false);
    }
  }, [params.model]);

  useEffect(() => {
    if (apiKey && apiKey.length > 10) {
       const timer = setTimeout(() => fetchModels(apiKey), 1000);
       return () => clearTimeout(timer);
    }
  }, [apiKey, fetchModels]);

  const handleGenerate = () => {
    if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
    onGenerate({ ...params, apiKey });
  };

  const handleChange = (field: string, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleOptionSelect = (key: string, value: string, e: React.MouseEvent) => {
      e.stopPropagation(); 
      setParams(prev => ({ ...prev, [key]: value }));
      setActiveDropdown(null); // Close after selection
  };

  const isSelected = (key: string, value: string) => {
      const current = (params as any)[key] || '';
      return current === value;
  };

  const clearField = (key: string) => {
      setParams(prev => ({ ...prev, [key]: '' }));
  };

  const renderField = (config: FieldOption) => (
    <div key={config.key} className="relative">
      {config.key === 'visualTheme' && <div className="h-px bg-[#E9E9E7] my-4"></div>}
      <div className="flex justify-between items-center mb-1.5">
        <label className="block text-xs font-medium text-[#37352F] opacity-60 uppercase">{config.label}</label>
        {(params as any)[config.key] && (
            <button onClick={() => clearField(config.key)} className="text-[10px] text-gray-400 hover:text-red-500">
                清除
            </button>
        )}
      </div>
      
      <div className="relative">
        <input 
            value={(params as any)[config.key] || ''}
            onChange={(e) => handleChange(config.key, e.target.value)}
            onFocus={() => setActiveDropdown(config.key)}
            className="notion-input"
            placeholder="选择或输入"
        />
        {activeDropdown === config.key && config.options.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-[#E9E9E7] rounded-sm shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                <div className="relative z-50">
                    {config.options.map((opt) => (
                        <div 
                            key={opt}
                            onClick={(e) => handleOptionSelect(config.key, opt, e)}
                            className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center ${isSelected(config.key, opt) ? 'bg-blue-50 text-blue-600' : 'text-[#37352F] hover:bg-[#EFEFED]'}`}
                        >
                            <span>{opt}</span>
                            {isSelected(config.key, opt) && <span className="text-xs">✓</span>}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#F7F7F5] p-5 h-full flex flex-col border-r border-[#E9E9E7]">
      <div className="flex items-center justify-between mb-6 text-[#37352F]">
        <div className="flex items-center">
            <Settings2 className="w-4 h-4 mr-2 opacity-60" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">配置参数</h2>
        </div>
        <Link href="/admin/config" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors text-xs text-[#2383E2] flex items-center">
            <Edit className="w-3 h-3 mr-1" /> 管理选项
        </Link>
      </div>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="group">
          <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">API 密钥</label>
          <div className="relative">
            <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="notion-input pr-8"
                placeholder="输入 Gemini API Key"
            />
            {loadingModels && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 pl-1">输入后自动加载可用模型</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">模型选择</label>
          <div className="relative">
            <select 
                value={params.model}
                onChange={(e) => handleChange('model', e.target.value)}
                className="notion-input appearance-none bg-no-repeat bg-[right_0.5rem_center] pr-8 cursor-pointer"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2337352F%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundSize: '0.65em auto' }}
            >
                {models.map(m => (
                <option key={m.name} value={m.name}>{m.displayName}</option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#37352F] opacity-60 mb-1.5 uppercase">视频时长</label>
          <div className="flex space-x-2">
            {['15', '30'].map(d => (
                <button
                    key={d}
                    onClick={() => handleChange('videoDuration', d)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm border transition-colors ${params.videoDuration === d ? 'bg-[#2383E2] text-white border-[#2383E2]' : 'bg-white text-[#37352F] border-[#E9E9E7] hover:bg-[#EFEFED]'}`}
                >
                    {d} 秒
                </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 pl-1">预计分镜数: {parseInt(params.videoDuration || '30') / 5}</p>
        </div>

        {fieldConfigs.map(config => renderField(config))}

      </div>

      <div className="pt-6 mt-auto space-y-3">
        <button
          onClick={() => onCreateCustom(params)}
          className="w-full py-2 bg-white border border-[#E9E9E7] text-[#37352F] rounded-sm text-sm font-medium hover:bg-[#EFEFED] transition-colors flex items-center justify-center"
        >
            <Edit className="w-4 h-4 mr-2" />
            自定义脚本
        </button>

        <button
          onClick={handleGenerate}
          disabled={loading || !apiKey}
          className="w-full notion-button notion-button-primary h-10 flex justify-center items-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? '生成中...' : '生成脚本'}
        </button>
      </div>
    </div>
  );
}