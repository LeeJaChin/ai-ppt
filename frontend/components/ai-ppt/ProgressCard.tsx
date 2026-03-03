import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  isGeneratingPPT: boolean;
  progress: number;
}

export default function ProgressCard({ isGeneratingPPT, progress }: ProgressCardProps) {
  if (!isGeneratingPPT) return null;

  return (
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
  );
}
