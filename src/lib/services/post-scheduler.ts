import { supabase } from '../supabase';
import { ScheduledPost } from '../types/scheduled-post';
import { PostPublisher } from './post-publisher';

export class PostScheduler {
  private static isRunning = false;
  private static checkInterval = 60000; // 1分ごとにチェック
  private static intervalId: NodeJS.Timeout | null = null;

  static async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(this.checkScheduledPosts, this.checkInterval);
    console.log('Post scheduler started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Post scheduler stopped');
  }

  private static async checkScheduledPosts() {
    try {
      // 現在時刻から5分以内に予定されている投稿を取得
      const { data: posts, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
        .gte('scheduled_at', new Date().toISOString());

      if (error) throw error;
      if (!posts || posts.length === 0) return;

      // 各投稿を処理
      await Promise.all(posts.map(async (post: ScheduledPost) => {
        try {
          await PostPublisher.publishPost(post);
        } catch (error) {
          console.error(`Failed to publish post ${post.id}:`, error);
        }
      }));
    } catch (error) {
      console.error('Error checking scheduled posts:', error);
    }
  }

  static async getFailedPosts(): Promise<ScheduledPost[]> {
    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'failed')
      .order('scheduled_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async retryFailedPost(postId: string) {
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) throw error;
    if (!post) throw new Error('Post not found');

    await PostPublisher.publishPost(post);
  }
}