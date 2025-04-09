import React, { useState } from 'react';
import { 
  Instagram, 
  Youtube, 
  GitBranch as BrandTiktok, 
  Link2, 
  Unlink, 
  Crown,
  User,
  Key,
  AlertCircle,
  Check,
  X,
  ChevronDown
} from 'lucide-react';

interface APIKeys {
  instagram?: {
    clientId: string;
    clientSecret: string;
  };
  youtube?: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
  };
  tiktok?: {
    clientKey: string;
    clientSecret: string;
  };
}

function Settings() {
  const [apiKeys, setApiKeys] = useState<APIKeys>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, 'success' | 'error' | null>>({});
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // サンプルユーザーデータ - 実際の実装では認証システムから取得
  const userData = {
    id: "user_123456789",
    email: "user@example.com",
    plan: "professional",
    planDetails: {
      name: "プロフェッショナルプラン",
      price: "¥9,800/月",
      features: [
        "全プラットフォーム対応",
        "無制限の投稿予約",
        "高度な分析機能",
        "優先サポート",
        "AIによる台本生成"
      ]
    }
  };

  // サンプル接続アカウントデータ
  const connectedAccounts = {
    instagram: {
      connected: true,
      username: '@your_instagram',
      followers: '24.5K',
      posts: '156',
    },
    youtube: {
      connected: false,
      username: '',
      subscribers: '',
      videos: '',
    },
    tiktok: {
      connected: true,
      username: '@your_tiktok',
      followers: '15.2K',
      videos: '45',
    },
  };

  const handleConnect = (platform: string) => {
    // OAuth接続ロジックを実装
    console.log(`Connecting to ${platform}`);
  };

  const handleDisconnect = (platform: string) => {
    // 接続解除ロジックを実装
    console.log(`Disconnecting from ${platform}`);
  };

  const handleAPIKeyChange = (platform: string, keyType: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [platform]: {
        ...(prev[platform as keyof APIKeys] || {}),
        [keyType]: value
      }
    }));
  };

  const handleTestConnection = async (platform: string) => {
    setTestStatus(prev => ({ ...prev, [platform]: null }));
    
    try {
      // API接続テストのモック
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ランダムな成功/失敗のシミュレーション
      const success = Math.random() > 0.5;
      
      if (success) {
        setTestStatus(prev => ({ ...prev, [platform]: 'success' }));
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      setTestStatus(prev => ({ ...prev, [platform]: 'error' }));
    }
  };

  const toggleShowKey = (platform: string) => {
    setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const togglePlatform = (platform: string) => {
    setExpandedPlatform(expandedPlatform === platform ? null : platform);
  };

  const getPlatformIcon = (platform: string, className = "w-6 h-6") => {
    switch (platform) {
      case 'instagram':
        return <Instagram className={className} />;
      case 'youtube':
        return <Youtube className={className} />;
      case 'tiktok':
        return <BrandTiktok className={className} />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 to-pink-500';
      case 'youtube':
        return 'from-red-600 to-red-500';
      case 'tiktok':
        return 'from-gray-900 to-gray-800';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const renderAPISettings = (platform: string) => {
    const isExpanded = expandedPlatform === platform;

    return (
      <div className="border-b last:border-b-0">
        <button
          onClick={() => togglePlatform(platform)}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {getPlatformIcon(platform)}
            <h4 className="font-medium text-gray-800">{platform} API設定</h4>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isExpanded && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-end gap-2 mb-4">
              {testStatus[platform] === 'success' && (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  接続成功
                </span>
              )}
              {testStatus[platform] === 'error' && (
                <span className="text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  接続失敗
                </span>
              )}
              <button
                onClick={() => handleTestConnection(platform)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                接続テスト
              </button>
            </div>

            <div className="grid gap-4">
              {platform === 'youtube' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[platform] ? "text" : "password"}
                      value={apiKeys[platform as keyof APIKeys]?.apiKey || ''}
                      onChange={(e) => handleAPIKeyChange(platform, 'apiKey', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder={`${platform} API Key`}
                    />
                    <button
                      onClick={() => toggleShowKey(platform)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showKeys[platform] ? "隠す" : "表示"}
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {platform === 'tiktok' ? 'Client Key' : 'Client ID'}
                </label>
                <div className="relative">
                  <input
                    type={showKeys[platform] ? "text" : "password"}
                    value={apiKeys[platform as keyof APIKeys]?.clientId || apiKeys[platform as keyof APIKeys]?.clientKey || ''}
                    onChange={(e) => handleAPIKeyChange(platform, platform === 'tiktok' ? 'clientKey' : 'clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`${platform} ${platform === 'tiktok' ? 'Client Key' : 'Client ID'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showKeys[platform] ? "text" : "password"}
                    value={apiKeys[platform as keyof APIKeys]?.clientSecret || ''}
                    onChange={(e) => handleAPIKeyChange(platform, 'clientSecret', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder={`${platform} Client Secret`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">アカウント設定</h2>
        <p className="text-gray-600">アカウント情報とSNS連携の管理</p>
      </div>

      <div className="grid gap-8">
        {/* User Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">ユーザー情報</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">ユーザーID</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={userData.id}
                    readOnly
                    className="bg-gray-50 px-3 py-2 rounded-lg text-gray-700 w-full"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(userData.id)}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    コピー
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">メールアドレス</label>
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  className="mt-1 bg-gray-50 px-3 py-2 rounded-lg text-gray-700 w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">利用プラン</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-800">{userData.planDetails.name}</h4>
                <p className="text-gray-600">{userData.planDetails.price}</p>
              </div>
              <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                プランを変更
              </button>
            </div>
            <div className="border-t pt-4">
              <h5 className="text-sm font-medium text-gray-600 mb-3">プラン特典</h5>
              <ul className="space-y-2">
                {userData.planDetails.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">API設定</h3>
            </div>
          </div>
          <div>
            {['instagram', 'youtube', 'tiktok'].map(platform => renderAPISettings(platform))}
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="grid gap-6">
          {Object.entries(connectedAccounts).map(([platform, account]) => (
            <div key={platform} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-r ${getPlatformColor(platform)} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform)}
                    <h3 className="text-xl font-semibold capitalize">{platform}</h3>
                  </div>
                  {account.connected ? (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">接続済み</span>
                  ) : (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm">未接続</span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {account.connected ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">ユーザー名</p>
                        <p className="text-lg font-semibold">{account.username}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">フォロワー</p>
                        <p className="text-lg font-semibold">{account.followers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">投稿数</p>
                        <p className="text-lg font-semibold">{account.posts || account.videos}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(platform)}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Unlink className="w-4 h-4" />
                      接続を解除
                    </button>
                  </>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      {platform === 'instagram' && 'Instagramアカウントを接続して、フォロワー数や投稿のパフォーマンスを分析できます。'}
                      {platform === 'youtube' && 'YouTubeチャンネルを接続して、視聴回数や登録者数の推移を確認できます。'}
                      {platform === 'tiktok' && 'TikTokアカウントを接続して、フォロワー数や動画のパフォーマンスを分析できます。'}
                    </p>
                    <button
                      onClick={() => handleConnect(platform)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      接続する
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;