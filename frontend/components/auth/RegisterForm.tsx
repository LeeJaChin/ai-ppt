import { useState } from 'react';
// 使用原生HTML元素替代UI组件
import { register } from '@/lib/api';

interface RegisterFormProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
  setError: (error: string | null) => void;
}

export default function RegisterForm({ onRegister, onSwitchToLogin, setError }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      onRegister();
    } catch (error: any) {
      setError(error.message || '注册失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">用户注册</h3>
        <p className="text-sm text-gray-500">请填写以下信息创建账号</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            姓名
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入您的姓名"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
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
            placeholder="至少6位密码"
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            确认密码
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入密码"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '注册中...' : '注册'}
        </button>
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-blue-600 hover:underline"
          >
            已有账号？立即登录
          </button>
        </div>
      </form>
    </div>
  );
}
