import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  setError: (error: string | null) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, setError }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  if (!isOpen) return null;

  const handleSwitchToRegister = () => setMode('register');
  const handleSwitchToLogin = () => setMode('login');
  const handleAuthSuccess = () => {
    onAuthSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            {mode === 'login' ? '用户登录' : '用户注册'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {mode === 'login' ? (
            <LoginForm
              onLogin={handleAuthSuccess}
              onSwitchToRegister={handleSwitchToRegister}
              setError={setError}
            />
          ) : (
            <RegisterForm
              onRegister={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
              setError={setError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
