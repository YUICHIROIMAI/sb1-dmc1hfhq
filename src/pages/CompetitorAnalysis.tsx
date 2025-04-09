import React, { useState } from 'react';
import { Search, Calendar, ArrowUpDown, Image as ImageIcon, Clock, Heart, MessageCircle, Eye, AlertCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

interface Post {
  id: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  views: number | null;
  image: string;
  type: 'image' | 'video' | 'carousel';
  platform: 'instagram' | 'youtube' | 'tiktok';
  engagement: number;
  shares?: number;
  subscribers?: number;
  duration?: string;
}

type SortField = 'timestamp' | 'likes' | 'comments' | 'views' | 'engagement';
type SortOrder = 'asc' | 'desc';

function CompetitorAnalysis() {
  const [accountUrl, setAccountUrl] = useState('');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'instagram' | 'youtube' | 'tiktok' | null>(null);

  const detectPlatform = (url: string): 'instagram' | 'youtube' | 'tiktok' | null => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('instagram.com')) return 'instagram';
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) return 'youtube';
      if (urlObj.hostname.includes('tiktok.com')) return 'tiktok';
      return null;
    } catch {
      return null;
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    const detectedPlatform = detectPlatform(accountUrl);
    
    if (!detectedPlatform) {
      setError('無効なURLです。Instagram、YouTube、またはTikTokのURLを入力してください。');
      return;
    }

    setPlatform(detectedPlatform);
    setIsAnalyzing(true);

    try {
      // 実際のAPIコールの代わりにサンプルデータを生成
      const sampleData = generateSampleData(detectedPlatform, 10);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPosts(sampleData);
      setAnalyzed(true);
    } catch (error) {
      setError('データの取得に失敗しました。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSampleData = (platform: 'instagram' | 'youtube' | 'tiktok', count: number): Post[] => {
    return Array.from({ length: count }).map((_, index) => {
      const basePost = {
        id: `post-${index}`,
        timestamp: format(subDays(new Date(), index), 'yyyy/MM/dd HH:mm', { locale: ja }),
        image: `https://source.unsplash.com/random/400x400?sig=${index}`,
        platform,
      };

      switch (platform) {
        case 'instagram':
          return {
            ...basePost,
            content: `Instagram投稿 ${index + 1} #fashion #lifestyle`,
            type: ['image', 'video', 'carousel'][Math.floor(Math.random() * 3)] as 'image' | 'video' | 'carousel',
            likes: Math.floor(Math.random() * 10000),
            comments: Math.floor(Math.random() * 500),
            views: Math.floor(Math.random() * 50000),
            engagement: Math.random() * 10,
          };

        case 'youtube':
          return {
            ...basePost,
            content: `YouTube動画 ${index + 1} - 完全ガイド`,
            type: 'video',
            likes: Math.floor(Math.random() * 50000),
            comments: Math.floor(Math.random() * 2000),
            views: Math.floor(Math.random() * 500000),
            subscribers: Math.floor(Math.random() * 100000),
            duration: '10:30',
            engagement: Math.random() * 15,
          };

        case 'tiktok':
          return {
            ...basePost,
            content: `TikTok動画 ${index + 1} #fyp #viral`,
            type: 'video',
            likes: Math.floor(Math.random() * 100000),
            comments: Math.floor(Math.random() * 1000),
            views: Math.floor(Math.random() * 1000000),
            shares: Math.floor(Math.random() * 5000),
            engagement: Math.random() * 20,
          };

        default:
          return basePost as Post;
      }
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'timestamp':
        comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        break;
      case 'likes':
        comparison = b.likes - a.likes;
        break;
      case 'comments':
        comparison = b.comments - a.comments;
        break;
      case 'views':
        comparison = (b.views || 0) - (a.views || 0);
        break;
      case 'engagement':
        comparison = b.engagement - a.engagement;
        break;
    }

    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Eye className="w-5 h-5 text-green-500" />;
      case 'carousel':
        return <div className="flex items-center gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-200"></div>
        </div>;
      default:
        return null;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderPlatformSpecificStats = () => {
    if (!analyzed || !platform) return null;

    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);
    const avgEngagement = posts.reduce((sum, post) => sum + post.engagement, 0) / posts.length;

    return (
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">総再生/表示回数</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{formatNumber(totalViews)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">
            {platform === 'youtube' ? '高評価数' : 'いいね数'}
          </h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{formatNumber(totalLikes)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">コメント数</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{formatNumber(totalComments)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-gray-500 text-sm font-medium">平均エンゲージメント率</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{avgEngagement.toFixed(1)}%</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">競合アカウント分析</h2>
        <p className="text-gray-600">競合アカウントの投稿データを分析します</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="grid gap-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アカウントURL
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={accountUrl}
                onChange={(e) => setAccountUrl(e.target.value)}
                placeholder="https://www.instagram.com/username/ または https://www.youtube.com/c/channel など"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !accountUrl}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isAnalyzing ? '分析中...' : '分析開始'}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              期間を指定
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <span className="text-gray-500">から</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {analyzed && (
        <>
          {/* Platform Specific Stats */}
          {renderPlatformSpecificStats()}

          {/* Posts Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">投稿一覧</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      サムネイル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      投稿形式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('timestamp')}>
                      <div className="flex items-center gap-2">
                        投稿時間
                        <ArrowUpDown className={`w-4 h-4 ${sortField === 'timestamp' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('views')}>
                      <div className="flex items-center gap-2">
                        再生/表示回数
                        <ArrowUpDown className={`w-4 h-4 ${sortField === 'views' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('likes')}>
                      <div className="flex items-center gap-2">
                        {platform === 'youtube' ? '高評価' : 'いいね'}
                        <ArrowUpDown className={`w-4 h-4 ${sortField === 'likes' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('comments')}>
                      <div className="flex items-center gap-2">
                        コメント
                        <ArrowUpDown className={`w-4 h-4 ${sortField === 'comments' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('engagement')}>
                      <div className="flex items-center gap-2">
                        エンゲージメント率
                        <ArrowUpDown className={`w-4 h-4 ${sortField === 'engagement' ? 'text-indigo-600' : 'text-gray-400'}`} />
                      </div>
                    </th>
                    {platform === 'tiktok' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        シェア数
                      </th>
                    )}
                    {platform === 'youtube' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        動画時間
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={post.image}
                          alt="Post thumbnail"
                          className="w-32 h-24 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPostTypeIcon(post.type)}
                          <span className="ml-2 text-sm text-gray-900">
                            {post.type === 'image' ? '画像' : post.type === 'video' ? '動画' : 'カルーセル'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="w-4 h-4 mr-1" />
                          {formatNumber(post.views || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-pink-600">
                          <Heart className="w-4 h-4 mr-1" />
                          {formatNumber(post.likes)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-blue-600">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {formatNumber(post.comments)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {post.engagement.toFixed(1)}%
                      </td>
                      {platform === 'tiktok' && post.shares !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(post.shares)}
                        </td>
                      )}
                      {platform === 'youtube' && post.duration !== undefined && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.duration}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CompetitorAnalysis;