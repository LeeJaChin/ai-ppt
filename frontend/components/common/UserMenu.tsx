import { useState } from 'react';
import { LogOut, History } from 'lucide-react';
import { getStoredUser, logout } from '@/lib/api';

interface UserMenuProps {
  onLogout: () => void;
  onOpenHistory: () => void;
}

export default function UserMenu({ onLogout, onOpenHistory }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = getStoredUser();

  const handleLogout = () => {
    logout();
    onLogout();
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* 用户头像按钮 */}
      <button
        onClick={toggleMenu}
        className="relative h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        aria-label="User menu"
      >
        <div className="bg-blue-600 text-white flex items-center justify-center rounded-full h-full w-full">
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50">
          {/* 用户信息 */}
          <div className="flex items-center justify-start gap-2 p-3 border-b border-gray-100">
            <div className="bg-blue-600 text-white flex items-center justify-center rounded-full h-8 w-8">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user.email || 'user@example.com'}</p>
            </div>
          </div>

          {/* 菜单项 */}
          <button
            onClick={() => {
              onOpenHistory();
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            <History className="mr-2 h-4 w-4" />
            <span>历史记录</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>登出</span>
          </button>
        </div>
      )}
    </div>
  );
}
