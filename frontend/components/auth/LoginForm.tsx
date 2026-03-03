import { useState } from 'react';
// 使用原生HTML元素替代UI组件
import { login } from '@/lib/api';

interface LoginFormProps {
  onLogin: () => void;
  onSwitchToRegister: () => void;
  setError: (error: string | null) => void;
}

export default function LoginForm({ onLogin, onSwitchToRegister, setError }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      onLogin();
    } catch (error: any) {
      setError(error.message || '登录失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">用户登录</h3>
        <p className="text-sm text-gray-500">请输入您的邮箱和密码登录</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '登录中...' : '登录'}
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-sm text-blue-600 hover:underline"
          >
            还没有账号？立即注册
          </button>
        </div>
      </form>
    </div>
  );
}
