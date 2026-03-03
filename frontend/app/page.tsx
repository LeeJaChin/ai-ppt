'use client';

/**
 * AI-PPT Architect 主页面
 */
import { useState, useEffect } from 'react';
import {
  generateOutline,
  generatePPT,
  getTaskStatus,
  getDownloadUrl,
  getAvailableModels,
  OutlineResponse,
  isAuthenticated,
  getStoredUser
} from '@/lib/api';



// 导入组件
import Header from '@/components/common/Header';
import ErrorAlert from '@/components/common/ErrorAlert';
import UserMenu from '@/components/common/UserMenu';
import InputCard from '@/components/ai-ppt/InputCard';
import ThemePreview from '@/components/ai-ppt/ThemePreview';
import TemplateUpload from '@/components/ai-ppt/TemplateUpload';
import OutlineCard from '@/components/ai-ppt/OutlineCard';
import ProgressCard from '@/components/ai-ppt/ProgressCard';
import PptPreview from '@/components/ai-ppt/PptPreview';
import FileConverter from '@/components/ai-ppt/FileConverter';
import AuthModal from '@/components/auth/AuthModal';
import HistoryModal from '@/components/ai-ppt/HistoryModal';

export default function Home() {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'ai-ppt' | 'tools'>('ai-ppt');
  const [content, setContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedTheme, setSelectedTheme] = useState('business');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [outline, setOutline] = useState<any>(null);
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [slideCount, setSlideCount] = useState(10);
  const [uploadedTemplateId, setUploadedTemplateId] = useState<string | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 认证相关的状态
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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
        setError('加载模型失败');
      }
    }
    loadModels();
  }, []);

  // 检查认证状态
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        const storedUser = getStoredUser();
        setUser(storedUser);
      }
    };
    
    checkAuthStatus();
  }, []);

  // 轮询PPT生成任务状态
  useEffect(() => {
    if (!taskId || !isGeneratingPPT) return;

    const interval = setInterval(async () => {
      try {
        const status = await getTaskStatus(taskId);
        setProgress(status.progress);

        if (status.status === 'completed') {
          setIsGeneratingPPT(false);
          clearInterval(interval);
          window.location.href = getDownloadUrl(taskId);
        } else if (status.status === 'failed') {
          setIsGeneratingPPT(false);
          setError(status.message || 'PPT生成失败');
          clearInterval(interval);
        }
      } catch (error) {
        console.error('查询PPT生成状态失败:', error);
        setError('查询PPT生成状态失败');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [taskId, isGeneratingPPT]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <Header />

        {/* 导航标签和用户菜单 */}
        <div className="flex justify-between items-center mb-8">
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
          <div className="flex items-center gap-2">
            {isAuthenticatedUser ? (
              <UserMenu 
                onLogout={() => {
                  setIsAuthenticatedUser(false);
                  setUser(null);
                }}
                onOpenHistory={() => setIsHistoryModalOpen(true)}
              />
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        <ErrorAlert error={error} onClose={() => setError(null)} />

        {activeTab === 'ai-ppt' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：输入区 */}
            <div className="space-y-6">
              <InputCard
                content={content}
                setContent={setContent}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={availableModels}
                slideCount={slideCount}
                setSlideCount={setSlideCount}
                setOutline={setOutline}
                setError={setError}
              />
              
              <ThemePreview
                selectedTheme={selectedTheme}
                setSelectedTheme={setSelectedTheme}
              />
              
              <TemplateUpload
                uploadedTemplateId={uploadedTemplateId}
                setUploadedTemplateId={setUploadedTemplateId}
                uploadedFilename={uploadedFilename}
                setUploadedFilename={setUploadedFilename}
                setError={setError}
              />
            </div>

            {/* 右侧：预览区 */}
            <div className="space-y-6">
              <OutlineCard
                outline={outline}
                setOutline={setOutline}
                selectedTheme={selectedTheme}
                uploadedTemplateId={uploadedTemplateId}
                isGeneratingPPT={isGeneratingPPT}
                setIsGeneratingPPT={setIsGeneratingPPT}
                taskId={taskId}
                setTaskId={setTaskId}
                setError={setError}
              />
              
              <ProgressCard
                isGeneratingPPT={isGeneratingPPT}
                progress={progress}
              />
              
              {taskId && !isGeneratingPPT && (
                <div className="mt-4">
                  <PptPreview taskId={taskId} setError={setError} />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 工具箱页面 */
          <FileConverter setError={setError} />
        )}

        {/* 认证模态框 */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => {
            setIsAuthenticatedUser(true);
            const storedUser = getStoredUser();
            setUser(storedUser);
          }}
          setError={setError}
        />

        {/* 历史记录模态框 */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          setError={setError}
        />
      </div>
    </div>
  );
}