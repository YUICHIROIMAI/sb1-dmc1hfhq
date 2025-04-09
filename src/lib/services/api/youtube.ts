import { supabase } from '../../supabase';

export class YouTubeAPI {
  private static async getCredentials(userId: string) {
    const { data, error } = await supabase
      .from('youtube_credentials')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async fetchChannelData(channelId: string) {
    const credentials = await this.getCredentials('system');
    const apiKey = credentials.api_key;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`
      );
      const data = await response.json();
      return data.items[0];
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      throw error;
    }
  }

  static async fetchChannelVideos(channelId: string, maxResults = 50) {
    const credentials = await this.getCredentials('system');
    const apiKey = credentials.api_key;

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
      );
      const data = await response.json();

      // Get video statistics
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const statsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`
      );
      const statsData = await statsResponse.json();

      // Combine video data with statistics
      return data.items.map((item: any, index: number) => ({
        ...item,
        statistics: statsData.items[index].statistics
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }
}