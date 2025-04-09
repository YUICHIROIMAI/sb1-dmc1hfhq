import { supabase } from '../../supabase';

export class InstagramAPI {
  private static async getCredentials(userId: string) {
    const { data, error } = await supabase
      .from('instagram_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async fetchUserData(username: string) {
    try {
      const response = await fetch(`https://www.instagram.com/${username}/?__a=1`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
      throw error;
    }
  }

  static async fetchUserPosts(username: string, count = 12) {
    try {
      const response = await fetch(`https://www.instagram.com/${username}/feed/?__a=1`);
      const data = await response.json();
      return data.user.media.nodes.slice(0, count);
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      throw error;
    }
  }
}