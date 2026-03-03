import { useState } from 'react';
// 使用原生HTML元素替代UI组件
import { FileText, Loader2 } from 'lucide-react';
import { generateOutline, OutlineResponse } from '@/lib/api';
// 暂时移除ErrorBoundary依赖

interface InputCardProps {
  content: string;
  setContent: (content: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: string[];
  slideCount: number;
  setSlideCount: (count: number) => void;
  setOutline: (outline: OutlineResponse | null) => void;
  setError: (error: string | null) => void;
}

function InputCard({ 
  content, 
  setContent, 
  selectedModel, 
  setSelectedModel, 
  availableModels, 
  slideCount, 
  setSlideCount, 
  setOutline, 
  setError 
}: InputCardProps) {
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  const handleGenerateOutline = async () => {
    if (!content.trim()) {
      setError('请输入需求内容');
      return;
    }

    setError(null);
    setIsGeneratingOutline(true);

    try {
      const result = await generateOutline(content, selectedModel, slideCount);
      setOutline(result);
    } catch (error: any) {
      setError(error.message || '生成大纲失败');
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">需求输入</h3>
        <p className="text-sm text-gray-500">
          描述您的 PPT 主题或粘贴长文本，AI 将自动提取大纲
        </p>
      </div>
      <div className="p-6 space-y-4">
        <textarea
          placeholder="例如：关于人工智能在医疗行业应用的公司汇报..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              AI 模型
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex justify-between">
              <span>幻灯片数量</span>
              <span className="text-blue-600 font-bold">{slideCount} 页</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateOutline}
          disabled={isGeneratingOutline || !content.trim()}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGeneratingOutline ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              生成大纲
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default InputCard;
