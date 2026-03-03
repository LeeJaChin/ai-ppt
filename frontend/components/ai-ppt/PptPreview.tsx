import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Loader2, X } from 'lucide-react';

interface PptPreviewProps {
  taskId: string | null;
  setError: (error: string | null) => void;
}

export default function PptPreview({ taskId, setError }: PptPreviewProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreview = async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);

    try {
      // 首先检查任务状态
      const taskStatusResponse = await fetch(`/api/task/${taskId}`);
      const taskStatus = await taskStatusResponse.json();

      if (taskStatus.status !== 'completed') {
        setError('PPT 尚未生成完成，请稍后再试');
        setIsLoading(false);
        return;
      }

      // 尝试获取PDF预览
      const response = await fetch(`/api/convert/ppt-to-pdf/${taskId}`);
      
      if (!response.ok) {
        throw new Error('生成预览失败');
      }

      const result = await response.json();
      
      if (result.status === 'completed' && result.download_url) {
        setPreviewUrl(`${window.location.origin}${result.download_url}`);
        setIsPreviewing(true);
      } else {
        // 如果是异步转换，轮询状态
        const interval = setInterval(async () => {
          const statusResponse = await fetch(`/api/task/${result.task_id}`);
          const status = await statusResponse.json();

          if (status.status === 'completed' && status.download_url) {
            setPreviewUrl(`${window.location.origin}${status.download_url}`);
            setIsPreviewing(true);
            clearInterval(interval);
          } else if (status.status === 'failed') {
            setError(status.message || '生成预览失败');
            clearInterval(interval);
          }
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || '生成预览失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {taskId && (
        <Button
          variant="outline"
          onClick={handlePreview}
          disabled={isLoading}
          className="mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成预览...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              在线预览 PPT
            </>
          )}
        </Button>
      )}

      {isPreviewing && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <CardTitle>PPT 在线预览</CardTitle>
              <button
                onClick={() => setIsPreviewing(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded-lg"
                title="PPT Preview"
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPreviewing(false)}
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  window.open(previewUrl, '_blank');
                }}
              >
                在新窗口打开
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
