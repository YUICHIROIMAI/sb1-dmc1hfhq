import { supabase } from '../supabase';
import { InstagramPost } from '../types/scheduled-post';

interface InstagramCredentials {
  accessToken: string;
  userId: string;
}

export class InstagramService {
  private static async getCredentials(userId: string): Promise<InstagramCredentials> {
    const { data, error } = await supabase
      .from('instagram_credentials')
      .select('access_token, instagram_user_id')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('Instagram credentials not found');
    }

    return {
      accessToken: data.access_token,
      userId: data.instagram_user_id
    };
  }

  static async publishPost(userId: string, post: InstagramPost) {
    try {
      const credentials = await this.getCredentials(userId);
      
      // Instagram Graph API endpoints
      const apiVersion = 'v18.0';
      const baseUrl = `https://graph.facebook.com/${apiVersion}`;

      // Step 1: Upload media
      const mediaResponses = await Promise.all(post.media.map(async (mediaUrl) => {
        const response = await fetch(`${baseUrl}/${credentials.userId}/media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: mediaUrl,
            caption: post.caption,
            access_token: credentials.accessToken,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to upload media to Instagram');
        }

        return response.json();
      }));

      // Step 2: Publish the post
      const publishResponse = await fetch(`${baseUrl}/${credentials.userId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: mediaResponses[0].id,
          access_token: credentials.accessToken,
        }),
      });

      if (!publishResponse.ok) {
        throw new Error('Failed to publish post to Instagram');
      }

      return await publishResponse.json();
    } catch (error) {
      console.error('Instagram publish error:', error);
      throw error;
    }
  }

  static async validateCredentials(userId: string): Promise<boolean> {
    try {
      const credentials = await this.getCredentials(userId);
      
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${credentials.accessToken}`
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}