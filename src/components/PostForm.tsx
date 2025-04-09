import React from 'react';
import { FileText, Video, Hash, Globe, Lock, Users, Music, Settings } from 'lucide-react';
import FileUploadField from './FileUploadField';

interface PostFormProps {
  platform: 'instagram' | 'youtube' | 'tiktok';
}

function PostForm({ platform }: PostFormProps) {
  const renderInstagramForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            投稿タイプ
          </div>
        </label>
        <select
          name="type"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="feed">フィード投稿</option>
          <option value="reel">リール</option>
        </select>
      </div>

      <FileUploadField
        name="media"
        accept="image/*,video/*"
        platform="instagram"
        type="feed"
        label="メディア"
        description="フィード投稿: 1:1の正方形画像を推奨 (最大10枚まで)
リール: 9:16の縦型動画を推奨 (最大90秒)"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            キャプション
          </div>
        </label>
        <textarea
          name="caption"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          maxLength={2200}
          placeholder="投稿の説明を入力（最大2,200文字）"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            ハッシュタグ
          </div>
        </label>
        <input
          type="text"
          name="hashtags"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="#example #hashtag"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            最初のコメント
          </div>
        </label>
        <textarea
          name="firstComment"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={2}
          placeholder="追加のハッシュタグやメンション"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hideLikes"
            id="hideLikes"
            className="rounded border-gray-300"
          />
          <label htmlFor="hideLikes" className="text-sm text-gray-700">
            いいね数を非表示
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="hideComments"
            id="hideComments"
            className="rounded border-gray-300"
          />
          <label htmlFor="hideComments" className="text-sm text-gray-700">
            コメントを無効化
          </label>
        </div>
      </div>
    </>
  );

  const renderYouTubeForm = () => (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            タイトル
          </div>
        </label>
        <input
          type="text"
          name="title"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          maxLength={100}
          placeholder="動画のタイトル（最大100文字）"
          required
        />
      </div>

      <FileUploadField
        name="videoFile"
        accept="video/*"
        platform="youtube"
        type="video"
        label="動画ファイル"
        description="動画ファイル（最大12時間、最大128GB）"
        required
      />

      <FileUploadField
        name="thumbnail"
        accept="image/*"
        platform="youtube"
        type="thumbnail"
        label="サムネイル"
        description="16:9の画像を推奨（1280x720px以上）"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            概要欄
          </div>
        </label>
        <textarea
          name="description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={5}
          maxLength={5000}
          placeholder="動画の説明（最大5,000文字）"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            タグ
          </div>
        </label>
        <input
          type="text"
          name="tags"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="タグをカンマ区切りで入力"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            公開設定
          </div>
        </label>
        <select
          name="privacyStatus"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="public">公開</option>
          <option value="unlisted">限定公開</option>
          <option value="private">非公開</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            詳細設定
          </div>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="madeForKids"
              id="madeForKids"
              className="rounded border-gray-300"
            />
            <label htmlFor="madeForKids" className="text-sm text-gray-700">
              子供向けコンテンツとして設定
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowComments"
              id="allowComments"
              className="rounded border-gray-300"
              defaultChecked
            />
            <label htmlFor="allowComments" className="text-sm text-gray-700">
              コメントを許可
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowRatings"
              id="allowRatings"
              className="rounded border-gray-300"
              defaultChecked
            />
            <label htmlFor="allowRatings" className="text-sm text-gray-700">
              評価を表示
            </label>
          </div>
        </div>
      </div>
    </>
  );

  const renderTikTokForm = () => (
    <>
      <FileUploadField
        name="videoFile"
        accept="video/*"
        platform="tiktok"
        type="video"
        label="動画"
        description="9:16の縦型動画を推奨（1080x1920px、最大3分）"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            キャプション
          </div>
        </label>
        <textarea
          name="description"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={3}
          maxLength={2200}
          placeholder="動画の説明（最大2,200文字）"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            ハッシュタグ
          </div>
        </label>
        <input
          type="text"
          name="hashtags"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="#fyp #viral"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            BGM
          </div>
        </label>
        <input
          type="text"
          name="backgroundMusic"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="使用する音楽のURL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            公開範囲
          </div>
        </label>
        <select
          name="visibility"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        >
          <option value="public">全員に公開</option>
          <option value="friends">フォロワーのみ</option>
          <option value="private">非公開</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            詳細設定
          </div>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowComments"
              id="allowComments"
              className="rounded border-gray-300"
              defaultChecked
            />
            <label htmlFor="allowComments" className="text-sm text-gray-700">
              コメントを許可
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowDuet"
              id="allowDuet"
              className="rounded border-gray-300"
              defaultChecked
            />
            <label htmlFor="allowDuet" className="text-sm text-gray-700">
              デュエットを許可
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="allowStitch"
              id="allowStitch"
              className="rounded border-gray-300"
              defaultChecked
            />
            <label htmlFor="allowStitch" className="text-sm text-gray-700">
              スティッチを許可
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disableDownload"
              id="disableDownload"
              className="rounded border-gray-300"
            />
            <label htmlFor="disableDownload" className="text-sm text-gray-700">
              ダウンロードを禁止
            </label>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {platform === 'instagram' && renderInstagramForm()}
      {platform === 'youtube' && renderYouTubeForm()}
      {platform === 'tiktok' && renderTikTokForm()}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          投稿時刻
        </label>
        <input
          type="time"
          name="time"
          className="px-3 py-2 border border-gray-300 rounded-md"
          defaultValue="12:00"
          required
        />
      </div>
    </div>
  );
}

export default PostForm;