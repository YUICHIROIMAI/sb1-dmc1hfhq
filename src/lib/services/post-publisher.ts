import { ScheduledPost } from '../types/scheduled-post';
import { InstagramService } from './instagram';
import { YouTubeService } from './youtube';
import { TikTokService } from './tiktok';
import { ScheduledPostService } from './scheduled-posts';

export class PostPublisher {
  static async publishPost(post: ScheduledPost) {
    try {
      // Update status to processing
      await ScheduledPostService.update(post.id!, {
        ...post,
        status: 'processing'
      });

      // Publish based on platform
      switch (post.content.platform) {
        case 'instagram':
          await InstagramService.publishPost(post.userId, post.content.data);
          break;
        case 'youtube':
          await YouTubeService.publishPost(post.userId, post.content.data);
          break;
        case 'tiktok':
          await TikTokService.publishPost(post.userId, post.content.data);
          break;
      }

      // Update status to published
      await ScheduledPostService.update(post.id!, {
        ...post,
        status: 'published'
      });
    } catch (error) {
      console.error('Post publishing failed:', error);
      
      // Update status to failed
      await ScheduledPostService.update(post.id!, {
        ...post,
        status: 'failed'
      });

      throw error;
    }
  }

  static async validateCredentials(userId: string, platform: string): Promise<boolean> {
    switch (platform) {
      case 'instagram':
        return InstagramService.validateCredentials(userId);
      case 'youtube':
        return YouTubeService.validateCredentials(userId);
      case 'tiktok':
        return TikTokService.validateCredentials(userId);
      default:
        return false;
    }
  }
}