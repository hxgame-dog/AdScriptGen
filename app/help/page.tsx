import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, Users, Video, Edit3, PenTool } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] font-sans text-[var(--foreground)] selection:bg-[var(--accent)] selection:text-white">
      <header className="h-14 glass-panel flex items-center px-6 justify-between flex-shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <Link href="/" className="p-1.5 hover:bg-[var(--accent-light)] hover:text-[var(--accent)] rounded-[var(--radius)] transition-colors text-[var(--muted)]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-base font-bold text-[var(--foreground)] font-mono tracking-tight">Help Guide</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="space-y-16">
            {/* Intro */}
            <section className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-6 font-mono tracking-tight text-[var(--foreground)]">AdScriptGen Studio</h2>
                <p className="text-lg leading-relaxed text-[var(--muted)] max-w-2xl mx-auto">
                    The professional AI-powered scriptwriting environment for game marketing teams. 
                    Generate, edit, and manage high-conversion ad creatives with precision.
                </p>
            </section>

            {/* Step 1: Generate & Create */}
            <section className="flex gap-8 group">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="text-[var(--accent)] mr-2 font-mono">01.</span> Generate & Create
                    </h3>
                    <ul className="space-y-4 text-sm text-[var(--foreground)] leading-relaxed">
                        <li className="flex items-start p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--accent)] transition-colors">
                            <span className="mr-3 font-bold text-blue-600 font-mono text-xs mt-0.5">AI</span>
                            <span>Configure game parameters, visual themes, and camera angles in the left panel. Click <strong>Generate Script</strong> to let the AI draft a complete storyboard with strategic analysis.</span>
                        </li>
                        <li className="flex items-start p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--accent)] transition-colors">
                            <span className="mr-3 font-bold text-blue-600 font-mono text-xs mt-0.5">MANUAL</span>
                            <span>Click <strong>Create Custom Script</strong> to open a blank canvas. Build your script scene by scene with total creative control.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Step 2: Edit */}
            <section className="flex gap-8 group">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100 group-hover:scale-110 transition-transform duration-300">
                    <Edit3 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="text-purple-600 mr-2 font-mono">02.</span> Refine & Edit
                    </h3>
                    <ul className="space-y-2 text-sm text-[var(--muted)] list-disc pl-4 leading-relaxed">
                        <li>Enter <strong>Edit Mode</strong> via the top toolbar to modify any field.</li>
                        <li>Rewrite visuals, tweak copy, or adjust AI image prompts directly.</li>
                        <li><strong>Add/Remove Scenes</strong> to perfect the flow.</li>
                        <li>Changes are saved to your local history and cloud database instantly.</li>
                    </ul>
                </div>
            </section>

            {/* Step 3: Production Management */}
            <section className="flex gap-8 group">
                <div className="w-12 h-12 rounded-[var(--radius)] bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0 border border-yellow-100 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="text-yellow-600 mr-2 font-mono">03.</span> Production Board
                    </h3>
                    <ul className="space-y-2 text-sm text-[var(--muted)] list-disc pl-4 leading-relaxed">
                        <li>Navigate to <strong>Production</strong> to view the Kanban board.</li>
                        <li>Track scripts from <strong>Draft</strong> → <strong>Pending</strong> → <strong>In Production</strong> → <strong>Done</strong>.</li>
                        <li>Cards feature high-visibility tags for quick visual identification of themes and styles.</li>
                    </ul>
                </div>
            </section>

            {/* Tips */}
            <section className="bg-[var(--surface)] p-8 rounded-[var(--radius)] border border-[var(--border)] shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-6 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Pro Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                        <h4 className="font-bold mb-2 text-[var(--foreground)]">Config Management</h4>
                        <p className="text-[var(--muted)]">Access the <strong>Admin Config</strong> page to customize game titles and dropdown options for your specific project needs.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-[var(--foreground)]">Smart Tags</h4>
                        <p className="text-[var(--muted)]">The system automatically extracts key parameters (Visuals, Camera) into color-coded tags for easy scanning.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-[var(--foreground)]">AI Prompts</h4>
                        <p className="text-[var(--muted)]">Every scene includes a dedicated <strong>Image Prompt</strong> field optimized for Midjourney/Stable Diffusion.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2 text-[var(--foreground)]">Data Safety</h4>
                        <p className="text-[var(--muted)]">Dual-layer storage (Local + Cloud) ensures your creative work is never lost, even offline.</p>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}