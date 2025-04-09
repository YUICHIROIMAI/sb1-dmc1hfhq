import { supabase } from '../supabase';

interface YouTubeCredentials {
  apiKey: string;
  channelId: string;
}

export async function getYouTubeAnalytics(startDate: string, endDate: string) {
  try {
    // Supabaseから認証情報を取得
    const { data: credentials, error } = await supabase
      .from('youtube_credentials')
      .select('*')
      .single();

    if (error || !credentials) {
      throw new Error('YouTube credentials not found');
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${credentials.channelId}&maxResults=50&type=video&key=${credentials.apiKey}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('YouTube API error:', error);
    throw error;
  }
}