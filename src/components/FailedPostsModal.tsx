import React from 'react';
import { X, AlertCircle, RotateCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { ScheduledPost } from '../lib/types/scheduled-post';

interface FailedPostsModalProps {
  posts: ScheduledPost[];
  onClose: () => void;
  onRetry: (postId: string) => Promise<void>;
}

function FailedPostsModal({ posts, onClose, onRetry }: FailedPostsModalProps) {
  const [retrying, setRetrying] = React.useState<Record<string, boolean>>({});

  const handleRetry = async (postId: string) => {
    setRetrying(prev => ({ ...prev, [postId]: true }));
    try {
      await onRetry(postId);
    } finally {
      setRetrying(prev => ({ ...prev, [postId]: false }));
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold">失敗した投稿</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              失敗した投稿はありません
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プラットフォーム
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    予定日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    コンテンツ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlatformName(post.platform)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(post.scheduledAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {post.content.data.caption || post.content.data.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleRetry(post.id!)}
                        disabled={retrying[post.id!]}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <RotateCw className={`w-4 h-4 ${retrying[post.id!] ? 'animate-spin' : ''}`} />
                        {retrying[post.id!] ? '再試行中...' : '再試行'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default FailedPostsModal;