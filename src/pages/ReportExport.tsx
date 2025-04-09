import React, { useState } from 'react';
import { Calendar, Instagram, Youtube, GitBranch as BrandTiktok, Download, Loader2, AlertCircle } from 'lucide-react';
import { exportReport } from '../lib/exportUtils';

type Platform = 'instagram' | 'youtube' | 'tiktok';

interface FilterOptions {
  startDate: string;
  endDate: string;
  platform: Platform | null;
}

function ReportExport() {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '',
    endDate: '',
    platform: null
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!filters.platform || !filters.startDate || !filters.endDate) {
      setError('期間とプラットフォームを選択してください。');
      return;
    }

    setIsExporting(true);
    setError(null);
    
    try {
      await exportReport(
        filters.platform,
        filters.startDate,
        filters.endDate
      );
    } catch (error) {
      console.error('Export failed:', error);
      setError('レポートの出力に失敗しました。もう一度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  const platforms: { id: Platform; name: string; icon: typeof Instagram; description: string }[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      description: 'フィード・リール投稿の分析、フォロワー属性など'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      description: '動画のパフォーマンス、チャンネル登録者の分析など'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: BrandTiktok,
      description: '動画の再生数、フォロワー属性など'
    }
  ];

  const getPlatformGradient = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return 'from-purple-500 to-pink-500';
      case 'youtube':
        return 'from-red-600 to-red-500';
      case 'tiktok':
        return 'from-gray-900 to-gray-800';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">レポート出力</h2>
        <p className="text-gray-600">SNSデータの分析レポートをエクスポート</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid gap-8">
        {/* Platform Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">1. プラットフォームを選択</h3>
          <div className="grid grid-cols-3 gap-4">
            {platforms.map(platform => (
              <button
                key={platform.id}
                onClick={() => setFilters(prev => ({ ...prev, platform: platform.id }))}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  filters.platform === platform.id
                    ? `bg-gradient-to-r ${getPlatformGradient(platform.id)} text-white border-transparent`
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <platform.icon className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-medium">{platform.name}</div>
                    <div className={`text-sm mt-1 ${
                      filters.platform === platform.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {platform.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">2. 期間を選択</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-gray-500">から</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!filters.platform || !filters.startDate || !filters.endDate || isExporting}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              エクスポート中...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              レポートをエクスポート
            </>
          )}
        </button>

        {/* Preview of Export Content */}
        {filters.platform && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">出力内容のプレビュー</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">アカウント分析シート</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {filters.platform === 'instagram' && (
                    <>
                      <li>フォロワー増減数及び終了期間時点のフォロワー数</li>
                      <li>投稿数（フィードとリール、それぞれの投稿数）</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>プロフィール閲覧数</li>
                      <li>サイトクリック数（プロフィール内）</li>
                      <li>フォロワー属性データ（年齢、性別、地域）</li>
                    </>
                  )}
                  {filters.platform === 'tiktok' && (
                    <>
                      <li>フォロワー増減数及び終了期間時点のフォロワー数</li>
                      <li>投稿数</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>プロフィール閲覧数</li>
                      <li>サイトクリック数（プロフィール内）</li>
                      <li>フォロワー属性データ（年齢、性別、地域）</li>
                    </>
                  )}
                  {filters.platform === 'youtube' && (
                    <>
                      <li>チャンネル登録者増減数及び終了期間時点の登録者数</li>
                      <li>投稿数</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>チャンネル閲覧数</li>
                      <li>概要欄リンククリック数</li>
                      <li>視聴者属性データ（年齢、性別、地域）</li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">投稿分析シート</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {filters.platform === 'instagram' && (
                    <>
                      <li>投稿種別（フィードorリール）</li>
                      <li>サムネイル</li>
                      <li>キャプション</li>
                      <li>ハッシュタグ</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>プロフィール遷移数</li>
                      <li>コメント数</li>
                      <li>いいね数</li>
                      <li>保存数</li>
                      <li>視聴維持率</li>
                      <li>投稿時間帯</li>
                    </>
                  )}
                  {filters.platform === 'tiktok' && (
                    <>
                      <li>サムネイル</li>
                      <li>キャプション</li>
                      <li>ハッシュタグ</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>プロフィール遷移数</li>
                      <li>コメント数</li>
                      <li>いいね数</li>
                      <li>保存数</li>
                      <li>シェア数</li>
                      <li>視聴維持率</li>
                      <li>投稿時間帯</li>
                    </>
                  )}
                  {filters.platform === 'youtube' && (
                    <>
                      <li>サムネイル</li>
                      <li>概要欄</li>
                      <li>ハッシュタグ</li>
                      <li>インプレッション数</li>
                      <li>リーチ数</li>
                      <li>チャンネル遷移数</li>
                      <li>コメント数</li>
                      <li>いいね数</li>
                      <li>視聴維持率</li>
                      <li>投稿時間帯</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportExport;