import React from 'react';
import { X, Instagram, Youtube, GitBranch as BrandTiktok, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { ScheduledPost } from '../lib/types/scheduled-post';

interface PostPreviewModalProps {
  post: ScheduledPost;
  onClose: () => void;
}

function PostPreviewModal({ post, onClose }: PostPreviewModalProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6" />;
      case 'youtube':
        return <Youtube className="w-6 h-6" />;
      case 'tiktok':
        return <BrandTiktok className="w-6 h-6" />;
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

  const renderPreview = () => {
    switch (post.platform) {
      case 'instagram':
        return (
          <div className="space-y-4">
            {/* Instagram Preview */}
            <div className="border rounded-xl overflow-hidden bg-white">
              {/* Header */}
              <div className="p-4 flex items-center gap-3 border-b">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="font-medium">Your Instagram Account</div>
              </div>

              {/* Media */}
              <div className="aspect-square relative">
                {post.content.data.type === 'feed' ? (
                  <img
                    src={post.content.data.media[0]}
                    alt="Post preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={post.content.data.media[0]}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Caption */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <p className="font-medium mb-1">Your Instagram Account</p>
                  <p className="whitespace-pre-wrap">{post.content.data.caption}</p>
                  <p className="text-blue-500 mt-1">
                    {post.content.data.hashtags.join(' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'youtube':
        return (
          <div className="space-y-4">
            {/* YouTube Preview */}
            <div className="border rounded-xl overflow-hidden bg-white">
              {/* Thumbnail */}
              <div className="aspect-video relative">
                <img
                  src={post.content.data.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">{post.content.data.title}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{post.content.data.description}</p>
                <div className="mt-2">
                  {post.content.data.tags.map((tag, index) => (
                    <span key={index} className="text-blue-500 mr-2">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tiktok':
        return (
          <div className="space-y-4">
            {/* TikTok Preview */}
            <div className="border rounded-xl overflow-hidden bg-white max-w-sm mx-auto">
              {/* Video */}
              <div className="aspect-[9/16] relative bg-black">
                <video
                  src={post.content.data.videoFile}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Caption */}
              <div className="p-4">
                <p className="whitespace-pre-wrap">{post.content.data.description}</p>
                <div className="mt-2">
                  {post.content.data.hashtags.map((tag, index) => (
                    <span key={index} className="text-blue-500 mr-2">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlatformIcon(post.platform)}
              <h3 className="text-xl font-semibold">
                {getPlatformName(post.platform)}プレビュー
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Scheduled Time */}
          <div className="mb-6 flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(parseISO(post.scheduledAt), 'yyyy年MM月dd日', { locale: ja })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{format(parseISO(post.scheduledAt), 'HH:mm', { locale: ja })}</span>
            </div>
          </div>

          {/* Platform-specific Preview */}
          {renderPreview()}
        </div>

        {/* Footer */}
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

export default PostPreviewModal;