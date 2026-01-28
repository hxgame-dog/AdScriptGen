import Link from 'next/link';
import { BookOpen, Layers, Video, Edit3, FolderOpen, Search, Filter } from 'lucide-react';

const Sparkles = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default function HelpContent() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        {/* Intro */}
        <section className="mb-12">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">欢迎使用 AdScriptGen</h2>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xl mx-auto">
                AdScriptGen 是一个专为游戏广告团队打造的 AI 脚本生成与协作平台。
                它集成了 AI 自动创作、精细化分镜编辑、制作看板管理以及素材归档库。
            </p>
        </section>

        <div className="space-y-12 text-left">
            {/* Step 1: Generate & Create */}
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">1. 生成与创作脚本</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        您可以选择 AI 极速生成，也可以开启空白模板手动创作。
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="block font-bold text-blue-600 text-[10px] uppercase mb-1">AI 生成</span>
                            <span className="text-[11px] text-gray-600">选择游戏、风格等参数，AI 自动产出策略、画面、音效及 Prompt。</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="block font-bold text-blue-600 text-[10px] uppercase mb-1">自定义脚本</span>
                            <span className="text-[11px] text-gray-600">点击侧边栏底部按钮，在空白模板中自由填写，适合已有构思的录入。</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Step 2: Edit */}
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">2. 精细化分镜编辑</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        无论是 AI 生成还是手动录入，所有脚本都支持二次编辑。
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-600 list-disc pl-4">
                        <li><strong>游戏关联</strong>: 编辑状态下可随时通过下拉框更改脚本所属的游戏。</li>
                        <li><strong>分镜管理</strong>: 自由添加或删除分镜，调整时间轴和内容描述。</li>
                        <li><strong>实时保存</strong>: 点击完成编辑后，系统会同步更新云端数据库。</li>
                    </ul>
                </div>
            </section>

            {/* Step 3: Production Management */}
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">3. 看板式制作管理</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        看板用于追踪脚本从“创意”到“成品”的全生命周期。
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-600 list-disc pl-4">
                        <li><strong>状态流转</strong>: 待提交 {"->"} 待制作 {"->"} 制作中 {"->"} 已完成。</li>
                        <li><strong>风格标签</strong>: 卡片自动显示视觉风格、运镜等标签，方便设计师快速理解。</li>
                        <li><strong>协作识别</strong>: 每个任务都会记录创建者，支持多人并行协作。</li>
                    </ul>
                </div>
            </section>

            {/* Step 4: Asset Library */}
            <section className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-2">4. 素材库与资源复盘</h3>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                        已完成的优质脚本和素材会自动归档至“素材库”。
                    </p>
                    <div className="bg-teal-50/30 border border-teal-100 p-3 rounded-lg space-y-2">
                        <div className="flex items-center text-[10px] text-teal-800 font-bold uppercase">
                            <Search className="w-3 h-3 mr-1" /> 高效查找
                        </div>
                        <p className="text-[11px] text-gray-600">支持按 <strong>游戏名称</strong>、<strong>素材评级 (S/A/B)</strong> 和 <strong>标题关键词</strong> 快速检索。</p>
                        <div className="flex items-center text-[10px] text-teal-800 font-bold uppercase pt-1">
                            <Filter className="w-3 h-3 mr-1" /> 深度复盘
                        </div>
                        <p className="text-[11px] text-gray-600">点击查看即可调出完整的原始脚本分镜，方便运营同学分析爆款逻辑。</p>
                    </div>
                </div>
            </section>
        </div>

        {/* Tips Grid */}
        <section className="mt-16 pt-8 border-t border-gray-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-center">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Pro Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-[#F7F7F5] rounded-xl">
                    <h4 className="font-bold text-xs mb-1">自动保存机制</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">系统采用双重存储。即使后端数据库连接异常，您的数据也会优先保存在本地浏览器缓存中，永不丢失。</p>
                </div>
                <div className="p-4 bg-[#F7F7F5] rounded-xl">
                    <h4 className="font-bold text-xs mb-1">AI 绘画助手</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">每个分镜底部的 Prompt 字段经过优化，可直接粘贴至 Midjourney 或 Stable Diffusion 生成高质量参考图。</p>
                </div>
            </div>
        </section>
    </div>
  );
}
