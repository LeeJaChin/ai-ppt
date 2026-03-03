import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { OutlineResponse, SlideContent, generatePPT } from '@/lib/api';
// 暂时移除ErrorBoundary依赖

interface OutlineCardProps {
  outline: OutlineResponse | null;
  setOutline: (outline: OutlineResponse | null) => void;
  selectedTheme: string;
  uploadedTemplateId: string | null;
  isGeneratingPPT: boolean;
  setIsGeneratingPPT: (generating: boolean) => void;
  taskId: string | null;
  setTaskId: (id: string | null) => void;
  setError: (error: string | null) => void;
}

function OutlineCard({ 
  outline, 
  setOutline, 
  selectedTheme, 
  uploadedTemplateId, 
  isGeneratingPPT, 
  setIsGeneratingPPT, 
  taskId, 
  setTaskId, 
  setError 
}: OutlineCardProps) {
  if (!outline) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-300 mb-4">📄</div>
          <p className="text-gray-500">
            输入需求并选择模型后，点击"生成大纲"开始
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleEditSlide = (index: number, field: keyof SlideContent, value: any) => {
    if (!outline) return;

    const newSlides = [...outline.slides];
    newSlides[index] = {
      ...newSlides[index],
      [field]: value,
    };

    setOutline({
      ...outline,
      slides: newSlides,
    });
  };

  const handleGenerateImage = async (index: number) => {
    if (!outline) return;
    
    try {
      // 这里需要调用后端API生成图片
      // 暂时显示加载状态
      setError('图片生成功能正在开发中...');
    } catch (error: any) {
      setError(error.message || '生成图片失败');
    }
  };

  const handleGenerateChart = async (index: number) => {
    if (!outline) return;
    
    try {
      // 这里需要调用后端API生成图表
      // 暂时显示加载状态
      setError('图表生成功能正在开发中...');
    } catch (error: any) {
      setError(error.message || '生成图表失败');
    }
  };

  const handleGeneratePPT = async () => {
    setError(null);
    setIsGeneratingPPT(true);

    try {
      const result = await generatePPT(outline, selectedTheme, uploadedTemplateId || undefined);
      setTaskId(result.task_id);
    } catch (error: any) {
      setError(error.message || '生成 PPT 失败');
      setIsGeneratingPPT(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>大纲预览</CardTitle>
        <CardDescription>
          您可以编辑大纲内容，然后生成 PPT
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PPT 标题 */}
        <div>
          <input
            type="text"
            value={outline.title}
            onChange={(e) =>
              setOutline({ ...outline, title: e.target.value })
            }
            className="text-2xl font-bold w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2"
          />
        </div>

        {/* 幻灯片列表 */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {outline.slides.map((slide, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xl">{slide.icon || '📄'}</span>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) =>
                          handleEditSlide(index, 'title', e.target.value)
                        }
                        className="font-semibold w-full border-b border-gray-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleGenerateImage(index)}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="生成相关图片"
                      >
                        🖼️
                      </button>
                      <button
                        onClick={() => handleGenerateChart(index)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="生成相关图表"
                      >
                        📊
                      </button>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        slide.layout === 'big_number' 
                          ? 'bg-purple-50 text-purple-600 border-purple-100' 
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {slide.layout}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-1 text-sm text-gray-600 mt-2">
                    {slide.bullet_points.map((point, pIndex) => (
                      <li key={pIndex} className="flex gap-2">
                        <span>•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {slide.data_points && slide.data_points.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {slide.data_points.map((dp, dIndex) => (
                        <span key={dIndex} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">
                          {dp.label}: {dp.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleGeneratePPT}
          disabled={isGeneratingPPT}
          className="w-full"
          size="lg"
          variant="default"
        >
          {isGeneratingPPT ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              确认生成 PPT
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default OutlineCard;
