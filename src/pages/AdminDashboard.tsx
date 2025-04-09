import React, { useState, useEffect } from 'react';
import { 
  Search,
  AlertCircle,
  Check,
  Crown,
  User,
  Key,
  Calendar,
  CreditCard,
  Mail,
  Lock,
  Plus,
  X,
  Wand2,
  Save,
  Instagram,
  Youtube,
  GitBranch as BrandTiktok
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

interface UserProfile {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  plan?: string;
}

interface PromptTemplate {
  id: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  model: string;
  type: string;
  prompt: string;
}

function AdminDashboard() {
  const { impersonate } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'prompts'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    isAdmin: false
  });

  useEffect(() => {
    loadUsers();
    loadPromptTemplates();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('is_admin', { ascending: false })
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('ユーザーの読み込みに失敗しました。');
    }
  };

  const loadPromptTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('platform')
        .order('type');

      if (error) throw error;
      setPromptTemplates(templates || []);
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      setError('プロンプトテンプレートの読み込みに失敗しました。');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (signUpError) throw signUpError;

      if (newUser.isAdmin) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('id', authData.user?.id);

        if (updateError) throw updateError;
      }

      setSuccess('ユーザーを追加しました。');
      setShowAddUserModal(false);
      setNewUser({ email: '', password: '', isAdmin: false });
      loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError('ユーザーの追加に失敗しました。');
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      if (authError) throw authError;

      if (authUser) {
        impersonate({
          ...authUser,
          user_metadata: { ...authUser.user_metadata, ...user }
        });
        setSuccess('ユーザーとしてログインしました。');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      setError('ユーザーへのログインに失敗しました。');
    }
  };

  const handlePromptSelect = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setEditingPrompt(prompt.prompt);
  };

  const handlePromptUpdate = async () => {
    if (!selectedPrompt) return;

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .update({ prompt: editingPrompt })
        .eq('id', selectedPrompt.id);

      if (error) throw error;

      setSuccess('プロンプトを更新しました。');
      loadPromptTemplates();
    } catch (error) {
      console.error('Error updating prompt:', error);
      setError('プロンプトの更新に失敗しました。');
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'tiktok':
        return <BrandTiktok className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      default:
        return platform;
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    return user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPlanBadgeColor = (plan: string = 'free') => {
    switch (plan.toLowerCase()) {
      case 'professional':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">管理画面</h2>
            <p className="text-gray-600">ユーザーとプロンプトの管理</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-5 h-5" />
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === 'prompts'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Wand2 className="w-5 h-5" />
              プロンプト管理
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {activeTab === 'users' ? (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="メールアドレスで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                ユーザーを追加
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        メールアドレス
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        パスワード
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        権限
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        プラン
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        作成日
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-gray-50 ${user.is_admin ? 'bg-purple-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {user.is_admin ? (
                              <Crown className="w-5 h-5 text-purple-500" />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">••••••••</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.is_admin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.is_admin ? '管理者' : '一般'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPlanBadgeColor(user.plan)}`}>
                          {user.plan || 'フリー'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(user.created_at), 'yyyy年MM月dd日', { locale: ja })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {!user.is_admin && (
                          <button
                            onClick={() => handleImpersonate(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-2"
                          >
                            <Key className="w-4 h-4" />
                            管理者としてログイン
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add User Modal */}
          {showAddUserModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">新規ユーザーを追加</h3>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAddUser} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        パスワード
                      </label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={newUser.isAdmin}
                        onChange={(e) => setNewUser(prev => ({ ...prev, isAdmin: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="isAdmin" className="text-sm text-gray-700">
                        管理者権限を付与
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddUserModal(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      追加
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Prompt List */}
          <div className="col-span-4 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">プロンプト一覧</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {promptTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handlePromptSelect(template)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedPrompt?.id === template.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(template.platform)}
                    <span className="font-medium">{getPlatformName(template.platform)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>モデル: {template.model}</div>
                    <div>タイプ: {template.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="col-span-8 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">プロンプト編集</h3>
            </div>
            {selectedPrompt ? (
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(selectedPrompt.platform)}
                    <span className="font-medium">{getPlatformName(selectedPrompt.platform)}</span>
                    <span className="text-sm text-gray-600">- {selectedPrompt.type}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    使用モデル: {selectedPrompt.model}
                  </div>
                </div>
                <textarea
                  value={editingPrompt}
                  onChange={(e) => setEditingPrompt(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handlePromptUpdate}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    更新
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                左側のリストからプロンプトを選択してください
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;