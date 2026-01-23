import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Users, Video } from 'lucide-react';

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
                    它能帮助你快速生成高质量的视频分镜脚本，并无缝衔接设计制作流程。
                </p>
            </section>

            {/* Step 1: Generate */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">1. 生成脚本</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li>在左侧面板配置游戏名称、时长、视觉风格等参数。</li>
                        <li>点击“生成脚本”，AI 将为您产出包含策略分析、分镜画面、文案和交互指令的完整脚本。</li>
                        <li>生成的脚本会自动保存到云端数据库（需配置），并同步到右侧的历史记录中。</li>
                    </ul>
                </div>
            </section>

            {/* Step 2: Production Management */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
                    <Video className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">2. 提交制作</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li>点击顶部导航栏的 <strong>“制作管理”</strong> 进入看板页面。</li>
                        <li>在左侧“待提交 (Drafts)”列表中找到您生成的脚本。</li>
                        <li>点击 <strong>“提交制作”</strong> 按钮，该脚本将流转到看板的“待制作”列，通知设计团队。</li>
                    </ul>
                </div>
            </section>

            {/* Step 3: Collaboration */}
            <section className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">3. 团队协作</h3>
                    <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                        <li><strong>设计师</strong>: 在看板中认领“待制作”的任务，点击“开始制作”。</li>
                        <li><strong>制作中</strong>: 此时脚本进入生产环节，其他人可见状态更新。</li>
                        <li><strong>验收</strong>: 制作完成后，点击“完成”，任务归档。</li>
                        <li>点击右上角的用户头像可以修改您的显示昵称。</li>
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
                        <h4 className="font-medium mb-1">导出 HTML</h4>
                        <p className="text-gray-500">在脚本详情页右上角，可以一键导出排版精美的 HTML 文件，方便打印或离线分享。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">中英双语</h4>
                        <p className="text-gray-500">生成的文案默认包含中英双语，方便投放海外市场。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">AI 提示词</h4>
                        <p className="text-gray-500">每个分镜现在都附带了 AI 绘画提示词 (Prompt)，可以直接复制到 Midjourney 使用。</p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-1">自定义配置</h4>
                        <p className="text-gray-500">在“管理选项”中，您可以自由添加新的视觉风格或音乐类型，配置仅本地生效。</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}