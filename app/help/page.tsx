import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import HelpContent from '@/components/HelpContent';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#37352F] flex flex-col">
      <header className="h-14 border-b border-[#E9E9E7] flex items-center px-6 justify-between flex-shrink-0 bg-white sticky top-0 z-20">
        <div className="flex items-center space-x-3 max-w-5xl mx-auto w-full">
          <Link href="/" className="p-1 hover:bg-[#EFEFED] rounded-sm transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#37352F]" />
          </Link>
          <h1 className="text-base font-semibold text-[#37352F]">使用说明书 (User Guide)</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <HelpContent />
      </div>
    </div>
  );
}