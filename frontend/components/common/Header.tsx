import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
        <Sparkles className="text-blue-600" size={48} />
        AI-PPT Architect
      </h1>
      <p className="text-xl text-gray-600">
        AI 驱动的 PPT 自动生成工具 · 让创作更高效
      </p>
    </div>
  );
}
