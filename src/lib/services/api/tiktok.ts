import { supabase } from '../../supabase';

export class TikTokAPI {
  private static async getCredentials(userId: string) {
    const { data, error } = await supabase
      .from('tiktok_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async fetchUserData(username: string) {
    try {
      const response = await fetch(`https://www.tiktok.com/@${username}?lang=en`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const html = await response.text();
      
      // Extract user data from HTML
      const userDataMatch = html.match(/"UserModule":(.*?),"UserPage"/);
      if (!userDataMatch) throw new Error('Could not find user data');
      
      const userData = JSON.parse(userDataMatch[1]);
      return userData;
    } catch (error) {
      console.error('Error fetching TikTok data:', error);
      throw error;
    }
  }

  static async fetchUserVideos(username: string, count = 30) {
    try {
      const response = await fetch(`https://www.tiktok.com/api/user/videos?username=${username}&count=${count}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching TikTok videos:', error);
      throw error;
    }
  }
}