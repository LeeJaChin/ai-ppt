import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThemePreviewProps {
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
}

export default function ThemePreview({ selectedTheme, setSelectedTheme }: ThemePreviewProps) {
  const themes = [
    { value: 'business', label: '商务风格', description: '专业、简洁' },
    { value: 'tech', label: '科技风格', description: '现代、创新' },
    { value: 'creative', label: '创意风格', description: '活力、多彩' },
  ];

  return (
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
  );
}
