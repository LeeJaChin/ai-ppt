import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileType, Loader2, RefreshCw } from 'lucide-react';
import { convertFile } from '@/lib/api';

interface FileConverterProps {
  setError: (error: string | null) => void;
}

export default function FileConverter({ setError }: FileConverterProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [convertMessage, setConvertMessage] = useState('');
  const [convertTaskId, setConvertTaskId] = useState<string | null>(null);

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

      // 轮询转换状态
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/task/${result.task_id}`);
          const status = await response.json();
          setConvertProgress(status.progress);

          if (status.status === 'completed') {
            setIsConverting(false);
            clearInterval(interval);
            window.location.href = `/api/download/${result.task_id}`;
          } else if (status.status === 'failed') {
            setIsConverting(false);
            setError(status.message || '转换失败');
            clearInterval(interval);
          }
        } catch (error) {
          console.error('查询转换状态失败:', error);
        }
      }, 1000);
    } catch (error: any) {
      setError(error.message || '发起转换失败');
      setIsConverting(false);
    }
  };

  return (
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
  );
}
