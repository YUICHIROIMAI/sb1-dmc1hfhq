import { supabase } from '../supabase';
import { YouTubePost } from '../types/scheduled-post';

interface YouTubeCredentials {
  apiKey: string;
  channelId: string;
}

export class YouTubeService {
  private static async getCredentials(userId: string): Promise<YouTubeCredentials> {
    const { data, error } = await supabase
      .from('youtube_credentials')
      .select('api_key, channel_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('YouTube credentials not found');
    }

    return {
      apiKey: data.api_key,
      channelId: data.channel_id
    };
  }

  static async publishPost(userId: string, post: YouTubePost) {
    try {
      const credentials = await this.getCredentials(userId);
      
      // YouTube Data API endpoint
      const baseUrl = 'https://www.googleapis.com/youtube/v3';

      // Step 1: Initialize upload
      const initResponse = await fetch(`${baseUrl}/videos?part=snippet,status&key=${credentials.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title: post.title,
            description: post.description,
            tags: post.tags,
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: post.privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        }),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize YouTube upload');
      }

      const uploadData = await initResponse.json();

      // Step 2: Upload video file
      // Note: In a real implementation, you would use the YouTube resumable upload API
      // This is a simplified version for demonstration
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: await fetch(post.videoFile).then(r => r.blob()),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video to YouTube');
      }

      return await uploadResponse.json();
    } catch (error) {
      console.error('YouTube publish error:', error);
      throw error;
    }
  }

  static async validateCredentials(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${credentials.apiKey}`
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}