'use client';

/**
 * AI-PPT Architect 主页面
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  generateOutline,
  generatePPT,
  getTaskStatus,
  getDownloadUrl,
  getAvailableModels,
  uploadTemplate,
  convertFile,
  OutlineResponse,
  SlideContent,
} from '@/lib/api';
import { Sparkles, FileText, Download, Loader2, Upload, FileCode, FileType, RefreshCw } from 'lucide-react';

export default function Home() {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'ai-ppt' | 'tools'>('ai-ppt');
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedTheme, setSelectedTheme] = useState('business');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [outline, setOutline] = useState<OutlineResponse | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [slideCount, setSlideCount] = useState(10);
  const [uploadedTemplateId, setUploadedTemplateId] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);

  // 转换相关状态
  const [convertTaskId, setConvertTaskId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertMessage, setConvertMessage] = useState('');

  // 加载可用模型
  useEffect(() => {
    async function loadModels() {
      try {
        const models = await getAvailableModels();
        setAvailableModels(models);
        if (models.length > 0) {
          setSelectedModel(models[0]);
        }
      } catch (error) {
        console.error('加载模型失败:', error);
      }
    }
    loadModels();
  }, []);

  // 轮询转换任务状态
  useEffect(() => {
    if (!convertTaskId || !isConverting) return;

    const interval = setInterval(async () => {
      try {
        const status = await getTaskStatus(convertTaskId);
        setConvertProgress(status.progress);
        setConvertMessage(status.message || '');

        if (status.status === 'completed') {
          setIsConverting(false);
          clearInterval(interval);
          if (status.download_url) {
            window.location.href = getDownloadUrl(convertTaskId);
          }
        } else if (status.status === 'failed') {
          setIsConverting(false);
          setError(status.message || '转换失败');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('查询转换状态失败:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [convertTaskId, isConverting]);

  // 处理文件转换
  const handleConvertFile = async (e: React.ChangeEvent<HTMLInputElement>, targetFormat: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsConverting(true);
    setConvertProgress(0);
    setConvertMessage('正在上传并处理...');

    try {
      const result = await convertFile(file, targetFormat);
      setConvertTaskId(result.task_id);
    } catch (error: any) {
      setError(error.message || '发起转换失败');
      setIsConverting(false);
    }
  };

  // 生成大纲
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

  // 生成 PPT
  const handleGeneratePPT = async () => {
    if (!outline) return;

    setError(null);
    setIsGeneratingPPT(true);
    setProgress(0);

    try {
      const result = await generatePPT(outline, selectedTheme, uploadedTemplateId || undefined);
      setTaskId(result.task_id);
    } catch (error: any) {
      setError(error.message || '生成 PPT 失败');
      setIsGeneratingPPT(false);
    }
  };

  // 编辑幻灯片
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

  // 处理模板上传
  const handleTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pptx')) {
      setError('请选择 .pptx 格式的文件');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadTemplate(file);
      setUploadedTemplateId(result.template_id);
      setUploadedFilename(result.filename);
    } catch (error: any) {
      setError(error.message || '模板上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 主题配置
  const themes = [
    { value: 'business', label: '商务风格', description: '专业、简洁' },
    { value: 'tech', label: '科技风格', description: '现代、创新' },
    { value: 'creative', label: '创意风格', description: '活力、多彩' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-blue-600" size={48} />
            AI-PPT Architect
          </h1>
          <p className="text-xl text-gray-600">
            AI 驱动的 PPT 自动生成工具 · 让创作更高效
          </p>
        </div>

        {/* 导航标签 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border flex gap-1">
            <button
              onClick={() => setActiveTab('ai-ppt')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'ai-ppt'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              AI 智能生成
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'tools'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              文件工具箱
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {activeTab === 'ai-ppt' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：输入区 */}
            <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>需求输入</CardTitle>
                <CardDescription>
                  描述您的 PPT 主题或粘贴长文本，AI 将自动提取大纲
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="例如：关于人工智能在医疗行业应用的公司汇报..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      AI 模型
                    </label>
                    <Select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </Select>
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

                <Button
                  onClick={handleGenerateOutline}
                  disabled={isGeneratingOutline || !content.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGeneratingOutline ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      生成大纲
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 主题预览 */}
            <Card>
              <CardHeader>
                <CardTitle>主题预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.value}
                      onClick={() => setSelectedTheme(theme.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTheme === theme.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm mb-1">
                        {theme.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {theme.description}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 自定义模板上传 */}
            <Card>
              <CardHeader>
                <CardTitle>自定义模板</CardTitle>
                <CardDescription>
                  上传您自己的 .pptx 模板，AI 将基于该模板生成 PPT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      className="relative overflow-hidden cursor-pointer"
                      disabled={isUploading}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pptx"
                        onChange={handleTemplateUpload}
                      />
                      {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {uploadedFilename ? '更换模板' : '上传模板'}
                    </Button>
                    {uploadedFilename && (
                      <div className="text-sm text-green-600 flex items-center gap-2">
                        <span>已选模板: {uploadedFilename}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-red-500 hover:text-red-700"
                          onClick={() => {
                            setUploadedTemplateId(null);
                            setUploadedFilename(null);
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    )}
                  </div>
                  {uploadedTemplateId && (
                    <p className="text-xs text-gray-500">
                      * 提示：上传模板后，系统将优先使用模板中的版式。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：预览区 */}
          <div className="space-y-6">
            {outline ? (
              <>
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
                                <span className={`ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                  slide.layout === 'big_number' 
                                    ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                  {slide.layout}
                                </span>
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

                {/* 进度条 */}
                {isGeneratingPPT && (
                  <Card>
                    <CardHeader>
                      <CardTitle>生成进度</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="mb-2" />
                      <p className="text-sm text-gray-600 text-center">
                        {progress}% 完成
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    输入需求并选择模型后，点击"生成大纲"开始
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
          /* 工具箱页面 */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PPT 转 PDF */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <FileType size={24} /> PPT 转 PDF
                  </CardTitle>
                  <CardDescription>将 PowerPoint 演示文稿转换为 PDF 格式</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pptx,.ppt"
                      onChange={(e) => handleConvertFile(e, 'pdf')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isConverting}
                    />
                    <Button variant="outline" className="w-full border-dashed border-2 py-8" disabled={isConverting}>
                      点击或拖拽上传 PPT
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Word 转 PDF */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <FileType size={24} /> Word 转 PDF
                  </CardTitle>
                  <CardDescription>将 Word 文档转换为 PDF 格式</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".docx,.doc"
                      onChange={(e) => handleConvertFile(e, 'pdf')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isConverting}
                    />
                    <Button variant="outline" className="w-full border-dashed border-2 py-8" disabled={isConverting}>
                      点击或拖拽上传 Word
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PDF 转 Word */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-500">
                    <RefreshCw size={24} /> PDF 转 Word
                  </CardTitle>
                  <CardDescription>将 PDF 文件还原为可编辑的 Word 文档</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleConvertFile(e, 'docx')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isConverting}
                    />
                    <Button variant="outline" className="w-full border-dashed border-2 py-8" disabled={isConverting}>
                      点击或拖拽上传 PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* PDF 转 PPT */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-500">
                    <RefreshCw size={24} /> PDF 转 PPT
                  </CardTitle>
                  <CardDescription>将 PDF 页面转换为 PPT 幻灯片</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleConvertFile(e, 'pptx')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isConverting}
                    />
                    <Button variant="outline" className="w-full border-dashed border-2 py-8" disabled={isConverting}>
                      点击或拖拽上传 PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 转换进度展示 */}
            {isConverting && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="py-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-700">正在处理您的文件...</span>
                      <span className="text-blue-600 font-bold">{convertProgress}%</span>
                    </div>
                    <Progress value={convertProgress} className="h-2 bg-blue-100" />
                    <p className="text-center text-sm text-blue-500 flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> {convertMessage}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
