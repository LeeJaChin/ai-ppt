import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, Download, Eye, Clock } from 'lucide-react';
import { getHistory, HistoryItem } from '@/lib/api';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  setError: (error: string | null) => void;
}

export default function HistoryModal({ isOpen, onClose, setError }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getHistory();
      setHistory(response.items);
    } catch (error: any) {
      setError(error.message || '加载历史记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (taskId: string) => {
    window.location.href = `/api/download/${taskId}`;
  };

  const handlePreview = (taskId: string) => {
    window.location.href = `/api/convert/ppt-to-pdf/${taskId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <CardTitle>历史记录</CardTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(item.task_id)}
                        className="mr-2"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        预览
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item.task_id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        下载
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
