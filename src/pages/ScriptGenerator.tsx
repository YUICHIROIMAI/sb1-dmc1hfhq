import React, { useState } from 'react';
import { Instagram, Youtube, GitBranch as BrandTiktok, Copy, Check, Wand2, Loader2 } from 'lucide-react';

type Platform = 'instagram' | 'youtube' | 'tiktok';

interface ScriptTemplate {
  title: string;
  script: string;
}

function ScriptGenerator() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [title, setTitle] = useState('');
  const [generatedScript, setGeneratedScript] = useState<ScriptTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedPlatform || !title) return;
    
    setIsGenerating(true);
    
    try {
      // TODO: 実際のAI APIとの統合
      // ここではモックのレスポンスを使用
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = {
        youtube: `【イントロ】
"みなさん、こんにちは！${title}についてご紹介します。"

【メインコンテンツ】
1. トピックの背景説明
   - 最新のトレンド分析
   - 専門家の見解

2. 主要なポイントの解説
   - 具体的な事例
   - 実践テクニック

3. 実践的なデモンストレーション
   - ステップバイステップ解説
   - よくある失敗とその対策

【アウトロ】
"いかがでしたでしょうか？
このチャンネルでは、今後も役立つ情報を発信していきますので、
チャンネル登録とベルマークの設定をお願いします！"

【概要欄】
${title}の完全ガイド
#教育 #ハウツー #テクノロジー

━━━━━━━━━━━━━━━━━━━━
【目次】
00:00 イントロダクション
01:30 トピックの背景
05:00 主要ポイント解説
10:00 実践デモ
15:00 まとめ
━━━━━━━━━━━━━━━━━━━━

関連動画:
・初心者向けガイド
・応用テクニック
・トラブルシューティング`,

        instagram: `【写真/動画のコンセプト】
${title}を視覚的に魅力的に表現
- 明るく洗練された画像
- アクションショット
- インフォグラフィック要素

【キャプション】
✨ ${title} の魅力を徹底解説！ ✨

今回は、皆さんからリクエストの多かった
${title}について詳しくご紹介します！

💡 知っておくべき3つのポイント
・最新トレンドと市場分析
・専門家からのアドバイス
・実践的なテクニック

詳しい情報は、プロフィールのリンクから📱
ブログで更に詳しく解説しています！

あなたの${title}に関する経験をコメント欄で教えてください！👇

【ハッシュタグ】
#${title.replace(/\s+/g, '')} #トレンド #最新情報
#インスタグラム #Reels #バズり投稿
#おすすめ #viral #trending
#インスタグラマー #フォローしてね`,

        tiktok: `【動画構成 15秒】
0-3秒: インパクトのあるフック
"${title}の驚きの事実を知ってる？🤔"

3-12秒: 核心コンテンツ
・トレンド情報
・意外な事実
・実践テクニック

12-15秒: 強力なCTA
"いいねとフォローで最新情報をチェック！"

【サウンド選択】
・トレンド曲をアレンジ
・テキスト読み上げ音声
・効果音でアクセント

【テキストオーバーレイ】
・見出し: "${title}の秘密"
・ポイント別テキスト
・CTA: "フォローして続きをチェック"

【編集効果】
・テキストアニメーション
・トランジション効果
・ズーム/パン

【キャプション】
${title}の裏技公開！🔥
みんなは知ってた？
#fyp #viral #tiktok #${title.replace(/\s+/g, '')}`,
      };

      setGeneratedScript({
        title,
        script: mockResponse[selectedPlatform]
      });
    } catch (error) {
      console.error('Script generation failed:', error);
      // エラー処理を追加
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedScript) return;
    
    try {
      await navigator.clipboard.writeText(generatedScript.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-6 h-6" />;
      case 'youtube':
        return <Youtube className="w-6 h-6" />;
      case 'tiktok':
        return <BrandTiktok className="w-6 h-6" />;
    }
  };

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'instagram':
        return 'Instagram';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">台本生成</h2>
        <p className="text-gray-600">AIを活用してSNSプラットフォームごとの最適な台本を生成</p>
      </div>

      <div className="grid gap-8">
        {/* Platform Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">1. プラットフォームを選択</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['instagram', 'youtube', 'tiktok'] as Platform[]).map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  selectedPlatform === platform
                    ? `bg-gradient-to-r ${getPlatformGradient(platform)} text-white border-transparent`
                    : `hover:bg-gradient-to-r hover:${getPlatformGradient(platform)} hover:text-white border-gray-200`
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  {getPlatformIcon(platform)}
                  <span className="font-medium">{getPlatformName(platform)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">2. タイトルを入力</h3>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 初心者向けプログラミング入門"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!selectedPlatform || !title || isGenerating}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>台本を生成</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Generated Script */}
        {generatedScript && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">生成された台本</h3>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    コピーしました
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    コピー
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                {generatedScript.script}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScriptGenerator;