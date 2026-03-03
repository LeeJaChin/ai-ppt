import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2 } from 'lucide-react';
import { uploadTemplate } from '@/lib/api';

interface TemplateUploadProps {
  uploadedTemplateId: string | null;
  setUploadedTemplateId: (id: string | null) => void;
  uploadedFilename: string | null;
  setUploadedFilename: (filename: string | null) => void;
  setError: (error: string | null) => void;
}

export default function TemplateUpload({ 
  uploadedTemplateId, 
  setUploadedTemplateId, 
  uploadedFilename, 
  setUploadedFilename, 
  setError 
}: TemplateUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

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

  return (
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
  );
}
