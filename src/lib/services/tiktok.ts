import { supabase } from '../supabase';
import { TikTokPost } from '../types/scheduled-post';

interface TikTokCredentials {
  accessToken: string;
  openId: string;
}

export class TikTokService {
  private static async getCredentials(userId: string): Promise<TikTokCredentials> {
    const { data, error } = await supabase
      .from('tiktok_credentials')
      .select('access_token, open_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('TikTok credentials not found');
    }

    return {
      accessToken: data.access_token,
      openId: data.open_id
    };
  }

  static async publishPost(userId: string, post: TikTokPost) {
    try {
      const credentials = await this.getCredentials(userId);
      
      // TikTok API endpoints
      const baseUrl = 'https://open.tiktokapis.com/v2';

      // Step 1: Initialize upload
      const initResponse = await fetch(`${baseUrl}/video/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_info: {
            title: post.description,
            privacy_level: 'PUBLIC',
            disable_duet: !post.allowDuet,
            disable_stitch: !post.allowStitch,
            disable_comment: !post.allowComments,
          },
        }),
      });

      if (!initResponse.ok) {
        throw new Error('Failed to initialize TikTok upload');
      }

      const uploadData = await initResponse.json();

      // Step 2: Upload video file
      const uploadResponse = await fetch(uploadData.upload_url, {
        method: 'PUT',
        body: await fetch(post.videoFile).then(r => r.blob()),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video to TikTok');
      }

      return await uploadResponse.json();
    } catch (error) {
      console.error('TikTok publish error:', error);
      throw error;
    }
  }

  static async validateCredentials(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      const response = await fetch(
        'https://open.tiktokapis.com/v2/user/info/',
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}