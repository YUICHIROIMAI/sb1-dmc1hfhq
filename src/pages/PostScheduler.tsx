import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Hash, 
  FileText, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  Instagram,
  Youtube,
  GitBranch as BrandTiktok,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Eye,
  RotateCw
} from 'lucide-react';
import { format, parseISO, isToday, isBefore, isAfter, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { useAuth } from '../contexts/AuthContext';
import { ScheduledPostService } from '../lib/services/scheduled-posts';
import { PostPublisher } from '../lib/services/post-publisher';
import { PostScheduler } from '../lib/services/post-scheduler';
import { ScheduledPost } from '../lib/types/scheduled-post';
import FailedPostsModal from '../components/FailedPostsModal';
import PostPreviewModal from '../components/PostPreviewModal';
import PostForm from '../components/PostForm';

function PostSchedulerPage() {
  const [showFailedPostsModal, setShowFailedPostsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [failedPosts, setFailedPosts] = useState<ScheduledPost[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [step, setStep] = useState<'platform' | 'details'>('platform');
  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({
    status: 'scheduled'
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPosts();
      loadFailedPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;

    try {
      const fetchedPosts = await ScheduledPostService.getByUserId(user.id);
      setPosts(fetchedPosts || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      setError('予約済み投稿の読み込みに失敗しました。');
    }
  };

  const loadFailedPosts = async () => {
    if (!user) return;

    try {
      const posts = await PostScheduler.getFailedPosts();
      setFailedPosts(posts);
    } catch (error) {
      console.error('Error loading failed posts:', error);
      setError('失敗した投稿の読み込みに失敗しました。');
    }
  };

  const handleRetryFailedPost = async (postId: string) => {
    try {
      await PostScheduler.retryFailedPost(postId);
      await loadFailedPosts();
      await loadPosts();
    } catch (error) {
      console.error('Error retrying failed post:', error);
      setError('投稿の再試行に失敗しました。');
    }
  };

  const handlePreviewPost = (post: ScheduledPost) => {
    setSelectedPost(post);
    setShowPreviewModal(true);
  };

  const handleSchedulePost = async () => {
    if (!selectedDate || !newPost.platform || !user) return;

    try {
      // Get form values
      const form = document.querySelector('form') as HTMLFormElement;
      const formData = new FormData(form);
      
      // Create platform-specific content
      let content;
      switch (newPost.platform) {
        case 'instagram':
          content = {
            platform: 'instagram',
            data: {
              type: formData.get('type') as 'feed' | 'reel',
              media: [formData.get('media') as File],
              caption: formData.get('caption') as string,
              hashtags: (formData.get('hashtags') as string || '').split(' ').filter(Boolean),
              hideLikes: formData.get('hideLikes') === 'on',
              hideComments: formData.get('hideComments') === 'on',
              firstComment: formData.get('firstComment') as string
            }
          };
          break;

        case 'youtube':
          content = {
            platform: 'youtube',
            data: {
              title: formData.get('title') as string,
              description: formData.get('description') as string,
              videoFile: formData.get('videoFile') as File,
              thumbnail: formData.get('thumbnail') as File,
              tags: (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean),
              privacyStatus: formData.get('privacyStatus') as string,
              madeForKids: formData.get('madeForKids') === 'on',
              allowComments: formData.get('allowComments') === 'on',
              allowRatings: formData.get('allowRatings') === 'on'
            }
          };
          break;

        case 'tiktok':
          content = {
            platform: 'tiktok',
            data: {
              videoFile: formData.get('videoFile') as File,
              description: formData.get('description') as string,
              hashtags: (formData.get('hashtags') as string || '').split(' ').filter(Boolean),
              backgroundMusic: formData.get('backgroundMusic') as string,
              visibility: formData.get('visibility') as string,
              allowComments: formData.get('allowComments') === 'on',
              allowDuet: formData.get('allowDuet') === 'on',
              allowStitch: formData.get('allowStitch') === 'on',
              disableDownload: formData.get('disableDownload') === 'on'
            }
          };
          break;
      }

      // Get selected time
      const timeValue = formData.get('time') as string || '12:00';
      const [hours, minutes] = timeValue.split(':').map(Number);
      
      // Set time on selected date
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      const post: Omit<ScheduledPost, 'id'> = {
        userId: user.id,
        platform: newPost.platform,
        scheduledAt: scheduledDate.toISOString(),
        status: 'scheduled',
        content
      };

      await ScheduledPostService.create(post);
      await loadPosts();
      
      setShowNewPostModal(false);
      setStep('platform');
      setNewPost({ status: 'scheduled' });
      setSelectedDate(null);
    } catch (error) {
      console.error('Error scheduling post:', error);
      setError('投稿の予約に失敗しました。');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const getPostsByDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = parseISO(post.scheduledAt);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });
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

  const renderCalendarDay = (date: Date) => {
    const dayPosts = getPostsByDate(date);
    const isInPast = isBefore(date, new Date()) && !isToday(date);

    return (
      <div
        className={`h-32 p-2 border border-gray-200 ${
          isToday(date) ? 'bg-blue-50' : isInPast ? 'bg-gray-50' : 'bg-white'
        }`}
      >
        <div className="flex justify-between items-start">
          <span className={`text-sm ${isInPast ? 'text-gray-400' : 'text-gray-700'}`}>
            {format(date, 'd')}
          </span>
          {!isInPast && (
            <button
              onClick={() => {
                setSelectedDate(date);
                setShowNewPostModal(true);
                setStep('platform');
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
        <div className="mt-1 space-y-1">
          {dayPosts.map(post => (
            <button
              key={post.id}
              onClick={() => handlePreviewPost(post)}
              className={`w-full text-left text-xs p-1 rounded cursor-pointer transition-colors ${
                post.status === 'published'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : post.status === 'failed'
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <div className="flex items-center gap-1">
                {getPlatformIcon(post.platform)}
                <span>{post.content.data.caption?.substring(0, 15) || post.content.data.title?.substring(0, 15)}...</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">投稿予約</h2>
            <p className="text-gray-600">コンテンツの投稿スケジュールを管理</p>
          </div>
          {failedPosts.length > 0 && (
            <button
              onClick={() => setShowFailedPostsModal(true)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              失敗した投稿 ({failedPosts.length})
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {format(currentMonth, 'yyyy年 M月', { locale: ja })}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px">
          {/* Calendar Header */}
          {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
            <div key={day} className="p-2 text-center font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div key={index}>
              {renderCalendarDay(date)}
            </div>
          ))}
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">予約済み投稿一覧</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プラットフォーム
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  投稿日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  コンテンツ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm text-gray-900">
                        {getPlatformName(post.platform)}
                      </span>
                    </div>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : post.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : post.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {post.status === 'published' ? '投稿済み' :
                       post.status === 'failed' ? '失敗' :
                       post.status === 'processing' ? '処理中' :
                       '予約済み'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreviewPost(post)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {post.status === 'failed' && (
                        <button
                          onClick={() => handleRetryFailedPost(post.id!)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showFailedPostsModal && (
        <FailedPostsModal
          posts={failedPosts}
          onClose={() => setShowFailedPostsModal(false)}
          onRetry={handleRetryFailedPost}
        />
      )}

      {showPreviewModal && selectedPost && (
        <PostPreviewModal
          post={selectedPost}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedPost(null);
          }}
        />
      )}

      {/* New Post Modal */}
      {showNewPostModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  {step === 'platform' ? '投稿するプラットフォームを選択' : '投稿を予約'}
                  <span className="ml-2 text-gray-500 text-base font-normal">
                    {format(selectedDate, 'yyyy年MM月dd日', { locale: ja })}
                  </span>
                </h3>
                <button
                  onClick={() => {
                    setShowNewPostModal(false);
                    setStep('platform');
                    setNewPost({ status: 'scheduled' });
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {step === 'platform' ? (
                <div className="grid grid-cols-3 gap-4">
                  {['instagram', 'youtube', 'tiktok'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        setNewPost({ ...newPost, platform: platform as any });
                        setStep('details');
                      }}
                      className={`p-6 rounded-lg border-2 transition-colors hover:bg-gradient-to-r ${getPlatformGradient(platform)} hover:text-white border-gray-200`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        {getPlatformIcon(platform)}
                        <span className="font-medium">{getPlatformName(platform)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <form>
                  <PostForm platform={newPost.platform!} />
                </form>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {step === 'details' && (
                <button
                  onClick={() => setStep('platform')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  戻る
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 'platform') {
                    setShowNewPostModal(false);
                    setStep('platform');
                    setNewPost({ status: 'scheduled' });
                  } else {
                    handleSchedulePost();
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                {step === 'platform' ? 'キャンセル' : '予約する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostSchedulerPage;