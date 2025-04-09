import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Settings as SettingsIcon,
  LogOut,
  Users,
  Crown,
  UserMinus,
  LayoutDashboard,
  Users as CompetitorIcon,
  Calendar,
  FileText,
  FileBarChart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, impersonatedUser, stopImpersonating } = useAuth();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const userNavItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'ダッシュボード'
    },
    {
      to: '/competitor-analysis',
      icon: CompetitorIcon,
      label: '競合分析'
    },
    {
      to: '/post-scheduler',
      icon: Calendar,
      label: '投稿予約'
    },
    {
      to: '/script-generator',
      icon: FileText,
      label: '台本作成'
    },
    {
      to: '/report-export',
      icon: FileBarChart,
      label: 'レポート出力'
    }
  ];

  // Show user navigation items if impersonating or not an admin
  const showUserNav = impersonatedUser || !isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <div className="p-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="ミルダス" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-800">ミルダス</h1>
          </div>
          {isAdmin && !impersonatedUser && (
            <div className="mt-2 flex items-center gap-2 text-purple-600">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">管理者</span>
            </div>
          )}
          {impersonatedUser && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-800">
                <span className="font-medium">{impersonatedUser.email}</span> として表示中
              </div>
              <button
                onClick={stopImpersonating}
                className="mt-1 text-xs text-yellow-600 hover:text-yellow-700 flex items-center gap-1"
              >
                <UserMinus className="w-3 h-3" />
                元のアカウントに戻る
              </button>
            </div>
          )}
        </div>

        <nav className="mt-4">
          {/* User Navigation Items */}
          {showUserNav && userNavItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-3 ${
                location.pathname === item.to
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}

          {/* Admin Navigation */}
          {isAdmin && !impersonatedUser && (
            <Link
              to="/admin"
              className={`flex items-center px-4 py-3 ${
                location.pathname === '/admin'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              ユーザー管理
            </Link>
          )}

          {/* Settings */}
          <Link
            to="/settings"
            className={`flex items-center px-4 py-3 ${
              location.pathname === '/settings'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mr-3" />
            設定
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            ログアウト
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;