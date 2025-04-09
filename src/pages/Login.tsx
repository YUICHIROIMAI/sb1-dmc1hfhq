import React, { useState } from 'react';
import { LogIn, KeyRound, Crown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { devModeAccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 開発モードかどうかをチェック
  const isDevelopment = import.meta.env.DEV;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        if (signInError.message === 'Invalid login credentials') {
          throw new Error('メールアドレスまたはパスワードが正しくありません。');
        }
        throw signInError;
      }

      if (!signInData.user) {
        throw new Error('ログインに失敗しました。');
      }

      // After successful sign in, get the user's profile to check admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', signInData.user.id)
        .maybeSingle();

      // If no profile exists, create one
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: signInData.user.id,
              email: signInData.user.email,
              is_admin: false
            }
          ]);

        if (createError) {
          console.error('Profile creation error:', createError);
          throw new Error('プロファイルの作成に失敗しました。');
        }

        // Navigate to settings for new users
        navigate('/settings');
        return;
      }

      // Navigate based on admin status
      if (profile.is_admin) {
        navigate('/admin');
      } else {
        navigate('/settings');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img src="/logo.svg" alt="ミルダス" className="h-10 w-10" />
              <h1 className="text-3xl font-bold text-gray-900">ミルダス</h1>
            </div>
            <p className="text-gray-600">SNS運用を効率よく</p>
          </div>

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  メールアドレス
                </div>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="example@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="password">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  パスワード
                </div>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>
          </form>

          {isDevelopment && devModeAccess && (
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">開発モード</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => devModeAccess('admin')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  <Crown className="w-4 h-4" />
                  管理者として確認
                </button>
                <button
                  onClick={() => devModeAccess('user')}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <User className="w-4 h-4" />
                  一般ユーザーとして確認
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>テスト用アカウント:</p>
            <p className="mt-1">管理者: admin@sns-manager.com / Admin123!@#</p>
            <p>一般ユーザー: user@company.com / User123!@#</p>
            <p>テストユーザー: test@example.com / Test123!@#</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;