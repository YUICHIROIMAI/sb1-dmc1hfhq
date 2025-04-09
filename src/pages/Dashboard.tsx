import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Instagram, Youtube, GitBranch as BrandTiktok, ChevronDown } from 'lucide-react';

// Instagram指標の定義
const instagramMetrics = {
  followers: 'フォロワー数',
  reach: 'リーチ数',
  impressions: '表示回数',
  profile_views: 'プロフィール表示回数',
  website_clicks: 'ウェブサイトクリック数'
};

// サンプルデータ生成関数
const generateData = (days: number, metrics: string[]) => {
  return Array.from({ length: days }).map((_, index) => {
    const date = subDays(new Date(), days - 1 - index);
    const data: any = {
      date: format(date, 'MM/dd', { locale: ja }),
    };
    metrics.forEach(metric => {
      data[metric] = Math.floor(Math.random() * 10000);
    });
    return data;
  });
};

// 統計データ生成関数
const generateStats = (startDate: Date, endDate: Date) => {
  const daysDiff = differenceInDays(endDate, startDate) + 1;
  const previousStartDate = subDays(startDate, daysDiff);
  const previousEndDate = subDays(endDate, daysDiff);

  // 現在期間のデータ
  const currentStats = {
    followers: Math.floor(Math.random() * 50000) + 10000,
    engagement: Math.floor(Math.random() * 20000) + 5000,
    watchTime: Math.floor(Math.random() * 300) + 60,
    posts: Math.floor(Math.random() * 200) + 50
  };

  // 前期間のデータ
  const previousStats = {
    followers: Math.floor(currentStats.followers * 0.95),
    engagement: Math.floor(currentStats.engagement * 0.95),
    watchTime: Math.floor(currentStats.watchTime * 0.95),
    posts: Math.floor(currentStats.posts * 0.95)
  };

  // 変化率の計算
  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  return {
    current: currentStats,
    changes: {
      followers: calculateChange(currentStats.followers, previousStats.followers),
      engagement: calculateChange(currentStats.engagement, previousStats.engagement),
      watchTime: calculateChange(currentStats.watchTime, previousStats.watchTime),
      posts: calculateChange(currentStats.posts, previousStats.posts)
    }
  };
};

// 期間オプション
const dateRangeOptions = [
  { label: '7日間', value: 7 },
  { label: '14日間', value: 14 },
  { label: '30日間', value: 30 },
];

function Dashboard() {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['followers']);
  const [dateRange, setDateRange] = useState(7);
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stats, setStats] = useState<any>(null);
  
  const data = generateData(dateRange, Object.keys(instagramMetrics));

  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const newStats = generateStats(start, end);
    setStats(newStats);
  }, [startDate, endDate]);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    // Calculate days between dates for the graph
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    setDateRange(days);
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
        return '';
    }
  };

  const getPlatformGradient = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 to-pink-500';
      case 'youtube':
        return 'from-red-600 to-red-500';
      case 'tiktok':
        return 'from-gray-900 to-gray-800';
      default:
        return '';
    }
  };

  // プラットフォームに応じたコンテンツを表示
  const renderPlatformContent = () => {
    switch (activePlatform) {
      case 'instagram':
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">表示する指標を選択</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(instagramMetrics).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleMetric(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedMetrics.includes(key)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">指標の推移</h3>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedMetrics.map((metric, index) => (
                      <Line
                        key={metric}
                        type="monotone"
                        dataKey={metric}
                        name={instagramMetrics[metric as keyof typeof instagramMetrics]}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
      case 'youtube':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">YouTube分析</h3>
            <p className="text-gray-600">準備中...</p>
          </div>
        );
      case 'tiktok':
        return (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">TikTok分析</h3>
            <p className="text-gray-600">準備中...</p>
          </div>
        );
      default:
        return null;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8">
      {/* Platform Selector */}
      <div className="mb-8">
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-6 py-3 rounded-lg flex items-center gap-3 text-white bg-gradient-to-r ${getPlatformGradient(activePlatform)}`}
          >
            {getPlatformIcon(activePlatform)}
            <span className="font-medium">{getPlatformName(activePlatform)}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
              {['instagram', 'youtube', 'tiktok'].map(platform => (
                platform !== activePlatform && (
                  <button
                    key={platform}
                    onClick={() => {
                      setActivePlatform(platform);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    {getPlatformIcon(platform)}
                    <span className="font-medium">{getPlatformName(platform)}</span>
                  </button>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">期間:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            />
            <span className="text-gray-500">から</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {dateRangeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  const end = new Date();
                  const start = subDays(end, option.value - 1);
                  handleDateChange(
                    format(start, 'yyyy-MM-dd'),
                    format(end, 'yyyy-MM-dd')
                  );
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">総フォロワー数</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{formatNumber(stats.current.followers)}</p>
            <span className={`text-sm ${stats.changes.followers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.changes.followers >= 0 ? '+' : ''}{stats.changes.followers.toFixed(1)}% 前期間比
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">総エンゲージメント</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{formatNumber(stats.current.engagement)}</p>
            <span className={`text-sm ${stats.changes.engagement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.changes.engagement >= 0 ? '+' : ''}{stats.changes.engagement.toFixed(1)}% 前期間比
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">平均視聴時間</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{formatTime(stats.current.watchTime)}</p>
            <span className={`text-sm ${stats.changes.watchTime >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.changes.watchTime >= 0 ? '+' : ''}{stats.changes.watchTime.toFixed(1)}% 前期間比
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">投稿数</h3>
            <p className="text-2xl font-bold text-gray-800 mt-2">{stats.current.posts}</p>
            <span className={`text-sm ${stats.changes.posts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.changes.posts >= 0 ? '+' : ''}{stats.changes.posts.toFixed(1)}% 前期間比
            </span>
          </div>
        </div>
      )}

      {/* Platform Specific Content */}
      {renderPlatformContent()}
    </div>
  );
}

export default Dashboard;