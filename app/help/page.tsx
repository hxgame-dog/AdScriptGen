import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Users, Video, Edit3, PenTool } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#37352F]">
      <header className="h-14 border-b border-[#E9E9E7] flex items-center px-6 justify-between flex-shrink-0 bg-white sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#37352F]" />
          </Link>
          <h1 className="text-base font-semibold text-[#37352F]">使用说明书</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="space-y-12">
            {/* Intro */}
            <section>
                <h2 className="text-2xl font-bold mb-4">欢迎使用 AdScriptGen</h2>
                <p className="text-sm leading-relaxed text-gray-600">
                    AdScriptGen 是一个专为游戏广告团队打造的 AI 脚本生成与协作平台。
                    它不仅能 AI 自动生成，还支持全手动创作和精细化编辑，无缝衔接设计制作流程。
                </p>
            </section>

            {/* Step 1: Generate & Create */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">1. 生成与创作脚本</h3>
                    <ul className="space-y-3 text-sm text-gray-600 pl-2">
                        <li className="flex items-start">
                            <span className="mr-2 font-bold text-blue-600">A. AI 生成:</span>
                            <span>在左侧面板选择游戏名称、时长、视觉风格等参数，点击“生成脚本”，AI 将为您产出包含策略分析、分镜画面、文案和交互指令的完整脚本。</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 font-bold text-blue-600">B. 自定义创作:</span>
                            <span>点击左侧底部的 <strong>“自定义脚本”</strong> 按钮，打开空白模板，您可以从零开始编写策略分析和分镜内容，像填写表格一样简单。</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Step 2: Edit */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Edit3 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">2. 二次编辑与优化</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li>在脚本详情页顶部，点击 <strong>“编辑”</strong> 按钮进入编辑模式。</li>
                        <li>您可以直接修改画面描述、音效、文案等任意字段。</li>
                        <li>支持 <strong>添加分镜</strong>、删除分镜，调整脚本结构。</li>
                        <li>编辑完成后点击保存，修改内容将实时同步至云端和历史记录。</li>
                    </ul>
                </div>
            </section>

            {/* Step 3: Production Management */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">3. 制作管理</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li>点击顶部导航栏的 <strong>“制作管理”</strong> 进入看板页面。</li>
                        <li>卡片上会清晰展示 <strong>游戏名称</strong> 和 <strong>风格标签</strong>（如低多边形、第一人称等），方便快速筛选。</li>
                        <li>在左侧“待提交”列找到脚本，点击“提交制作”流转给设计团队。</li>
                    </ul>
                </div>
            </section>

            {/* Step 4: Collaboration */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">4. 团队协作</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li><strong>设计师</strong>: 在看板中认领“待制作”的任务，点击“开始制作”。</li>
                        <li><strong>制作中</strong>: 此时脚本进入生产环节，状态实时更新。</li>
                        <li><strong>验收</strong>: 制作完成后，点击“完成”，任务归档。</li>
                    </ul>
                </div>
            </section>

            {/* Tips */}
            <section className="bg-[#F7F7F5] p-6 rounded-lg border border-[#E9E9E7]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    小技巧
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h4 className="font-medium mb-1">游戏名称管理</h4>
                        <p className="text-gray-500">在“管理选项”中，您可以配置常用的游戏名称列表，配置后会在主页下拉框中显示。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">多彩标签</h4>
                        <p className="text-gray-500">系统会自动提取脚本参数（如视觉风格、运镜等）生成彩色标签，在历史记录和看板中一目了然。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">AI 提示词</h4>
                        <p className="text-gray-500">每个分镜附带 AI 绘画提示词 (Prompt)，可直接复制用于 Midjourney 生成分镜图。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">数据安全</h4>
                        <p className="text-gray-500">系统采用双重存储机制，即使网络中断，您的脚本也会安全保存在本地浏览器的缓存中。</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}